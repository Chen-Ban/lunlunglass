import React from 'react'
import { Link } from 'react-router-dom'
import { LOGIN } from '../../router'

export default function UserInfo() {
  return <Link to={LOGIN}>登录</Link>
}
