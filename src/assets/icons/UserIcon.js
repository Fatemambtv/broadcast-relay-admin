// src/assets/icons/UserIcon.js
//npm install vite-plugin-svgr --save-dev
import React from 'react';
import { ReactComponent as UserSvg } from './UserIcon.svg';

const UserIcon = (props) => <UserSvg {...props} />;
export default UserIcon;