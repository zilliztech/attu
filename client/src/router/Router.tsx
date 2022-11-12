import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Collection from '../pages/collections/Collection';
import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Users from '../pages/user/User';
import Index from '../pages/index';
import Search from '../pages/search/VectorSearch';
import System from '../pages/system/SystemView';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:collectionName" element={<Collection />} />
          <Route path="/users" element={<Users />} />
          <Route path="/search" element={<Search />} />
          <Route path="/system" element={<System />} />
        </Route>
        <Route path="/connect" element={<Connect />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Router;
