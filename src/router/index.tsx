import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout/MainLayout'
import ManageLayout from '../layouts/ManageLayout/ManageLayout'
import PrintLayout from '../layouts/PrintLayout/PrintLayout'

import Home from '../pages/Home/Home'

import Login from '../pages/Login/Login'

import UserArchive from '../pages/Manage/UserArchive/UserArchive'
import AddUser from '../pages/Manage/AddUser/AddUser'
import List from '../pages/Manage/List/List'
import Start from '../pages/Manage/Start/Start'
import Trash from '../pages/Manage/Trash/Trash'

import NotFound from '../pages/NotFound/NotFound'

import Template from '../pages/Print/Template/Template'
import PrintArchive from '../pages/Print/PrintArchive/PrintArchive'

import Register from '../pages/Register/Register'

export default function router() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="manage" element={<ManageLayout />}>
            <Route path=":id" element={<UserArchive />} />
            <Route path="add" element={<AddUser />} />
            <Route path="list" element={<List />} />
            <Route path="start" element={<Start />} />
            <Route path="trash" element={<Trash />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/print" element={<PrintLayout />}>
          <Route path="template/:type/:templateId" element={<Template />} />
          <Route path="archive/:user_id/:archive_id" element={<PrintArchive />} />
        </Route>
      </Routes>
    </Router>
  )
}

export const HOME = '/'

export const LOGIN = '/login'

export const REGISTER = '/register'

export const MANAGE = '/manage'
export const MANAGE_LIST = '/manage/list'
export const MANAGE_START = '/manage/start'
export const MANAGE_TRASH = '/manage/trash'
export const MANAGE_ADDUSER = '/manage/add'

export const NOTFUND = '/NotFund'

export const PRINT = '/print'
export const PRINT_ARCHIVE = '/print/archive'
export const PRINT_TEMPLATE = '/print/template'
