/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-08-22 11:05:11
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2024-08-22 17:18:14
 * @Description: 保存角色数据 Dto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SaveRoleDto {
  @ApiProperty({
    type: String,
    description: '角色名称',
    default: '超级管理员',
  })
  @IsNotEmpty({ message: '角色名称必填' })
  name: string;

  @ApiProperty({
    type: String,
    description: '角色编码',
    default: '超级管理员',
  })
  @IsNotEmpty({ message: '角色编码必填' })
  code: string;

  @ApiProperty({
    type: Number,
    description: '排序',
    default: 1,
  })
  @IsNumber(
    {},
    {
      message: '排序必须为数字',
    },
  )
  sort: number;

  @ApiProperty({
    type: String,
    description: '角色描述',
    default: '拥有系统全部权限',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: [Object],
    description: '菜单权限集合',
    default: [{ menuId: 'dea4e038-592f-4532-ac86-c7de25a3416c', actions: ['add', 'edit'] }],
    isArray: true,
  })
  @IsArray({
    message: '菜单权限必须是数组类型',
  })
  menus: { menuId: string; actions: string[] }[];
}
