import React from 'react';
import { IconsType } from './Types';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ClearIcon from '@material-ui/icons/Clear';
import ReorderIcon from '@material-ui/icons/Reorder';
import AppsIcon from '@material-ui/icons/Apps';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const icons: { [x in IconsType]: (props?: any) => React.ReactElement } = {
  search: (props = {}) => <SearchIcon {...props} />,
  add: (props = {}) => <AddIcon {...props} />,
  delete: (props = {}) => <DeleteIcon {...props} />,
  list: (props = {}) => <ReorderIcon {...props} />,
  copy: (props = {}) => <FileCopyIcon {...props} />,
  visible: (props = {}) => <Visibility {...props} />,
  invisible: (props = {}) => <VisibilityOff {...props} />,
  error: (props = {}) => <CancelIcon {...props} />,
  clear: (props = {}) => <ClearIcon {...props} />,
  more: (props = {}) => <MoreVertIcon {...props} />,
  app: (props = {}) => <AppsIcon {...props} />,
  success: (props = {}) => <CheckCircleIcon {...props} />,
};

export default icons;
