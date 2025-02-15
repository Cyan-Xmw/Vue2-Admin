/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-07-11 09:59:05
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2024-11-11 16:19:34
 * @Description: AuthService
 */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Menu, Status, type User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { lastValueFrom, map } from 'rxjs';

import { LOCALES } from '@/enums';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { convertFlatDataToTree, initializeLang, initializeTree, omit, responseMessage } from '@/utils';

import { juejinParamsDto, LoginParamsDto } from './dto/params-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) { }
  /**
   * @description: 用户登录
   */
  async login(params: LoginParamsDto, session: CommonType.SessionInfo, ip: string) {
    // 获取验证码
    const { captchaCode } = params;
    // 判断验证码
    if (captchaCode.toUpperCase() !== session.captchaCode.toUpperCase()) {
      return responseMessage(null, '验证码错误', -1);
    }
    // 登录参数校验结果
    const user = await this.validateUser(params);

    if (!user) {
      return responseMessage(null, '用户名或密码错误', -1);
    }

    // 判断用户是否禁用
    if (user.status === Status.INACTIVE) {
      return responseMessage(null, '该用户已被禁用', -1);
    }

    // 生成 token
    const tokens = await this.generateTokens(user);

    // 登录成功，更新用户信息
    const userInfo = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginCount: { increment: 1 }, // 登录次数 + 1
        lastLoginAt: new Date(),
        lastIp: ip,
        token: tokens.token,
      },
      include: {
        role: true,
        organization: true,
        post: true,
      },
    });

    // 存储用户信息到 session
    session.userInfo = userInfo;

    // 验证成功，返回 token
    return responseMessage<Pick<User, 'token'>>(tokens);
  }

  /**
   * @description: 获取用户信息
   */
  async getUserInfo(session: CommonType.SessionInfo) {
    // 获取 session 用户信息
    const userInfo = omit(session.userInfo, ['password', 'token']);
    // 获取所有与 roleId 相关的 menuId
    const permissions = await this.prisma.permission
      .findMany({
        where: {
          roleId: userInfo.roleId,
        },
        include: {
          role: true,
          menu: true,
        },
      })
      .then((results) =>
        results.map((result) => ({
          permissionId: result.menu.name,
          actionList: result.actions,
        })),
      );
    return responseMessage<User>({
      ...userInfo,
      roleInfo: userInfo.role,
      role: {
        permissions: [
          {
            permissionId: 'home',
            actionList: [],
          },
          ...permissions,
        ],
      },
    });
  }

  /**
   * @description: 验证用户登录
   */
  async validateUser(params: LoginParamsDto): Promise<User | null> {
    // 解构参数
    const { userName, password } = params;

    // 查询数据库中对应的用户
    const userInfo = await this.prisma.user.findUnique({
      where: { userName },
    });
    if (userInfo && (await this.comparePassword(password, userInfo.password))) {
      // 如果用户名密码正确，则返回用户对象
      return userInfo;
    }
    return null;
  }

  /**
   * @description: 生成 token
   */
  async generateTokens(userInfo: User): Promise<Pick<User, 'token'>> {
    const payload: CommonType.TokenPayload = { userName: userInfo.userName, sub: userInfo.id };

    const token = this.jwtService.sign(payload, {
      expiresIn: '3d', // 设置访问 token 的过期时间为 3 天
    });

    return { token };
  }

  /**
   * @description: 用户注销登录
   */
  async logout(session) {
    const { userInfo } = session;
    const { id } = userInfo;
    // 清空数据库中 token
    await this.prisma.user.update({
      where: { id },
      data: { token: null },
    });
    // 清除 session
    session.destroy();
    // 保存操作日志
    return responseMessage({}, '注销成功');
  }

  /**
   * @description: 用于生成密码的哈希值
   */
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10; // 盐轮数
    return bcrypt.hash(password, saltOrRounds);
  }

  /**
   * @description: 用于验证用户提供的密码是否与数据库中存储的哈希密码匹配
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * @description: 获取国际化数据
   */
  async getLocales() {
    const result: Partial<Record<LOCALES, any>> = {};
    // 查询全部数据
    const sqlData = await this.prisma.internalization.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    // 将数据转成树形结构
    const localesTree = initializeTree(sqlData, 'id', 'parentId', 'children');
    // 获取多语言
    const locales: string[] = Object.values(LOCALES);
    // 转成层级对象
    for (let i = 0; i < locales.length; i++) {
      const lang = locales[i];
      result[lang] = initializeLang(localesTree, lang, 'name');
    }
    return responseMessage<CommonType.LanguageResult>(result);
  }

  /**
   * @description: 掘金文章列表
   */
  async juejin(params: juejinParamsDto) {
    const url = 'https://api.juejin.cn/content_api/v1/article/query_list';
    const responseData: any = await lastValueFrom(this.httpService.post(url, params).pipe(map((res) => res.data)));
    return responseMessage({
      list: responseData.data,
      total: responseData.count,
    });
  }

  /**
   * @description: 获取动态路由
   */
  async getDynamicRoutes(session: CommonType.SessionInfo) {
    // 获取 session 用户信息
    const userInfo = omit(session.userInfo, ['password', 'token']);
    // 获取所有与 roleId 相关的 menuId
    const menuIds = await this.prisma.permission
      .findMany({
        where: {
          roleId: userInfo.roleId,
        },
        select: {
          menuId: true,
        },
      })
      .then((results) => results.map((result) => result.menuId));
    const result = await this.prisma.menu.findMany({
      where: {
        id: {
          in: menuIds,
        },
      },
      orderBy: [
        { sort: 'asc' }, // 按照sort字段升序
        { createdAt: 'desc' }, // 如果sort相同，再按照createdAt字段降序
      ],
    });
    return responseMessage<Menu>(convertFlatDataToTree(result));
  }
}
