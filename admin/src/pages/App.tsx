import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import { Layouts } from '@strapi/strapi/admin';
import { Form } from './Form';
import { HomePage } from './HomePage';
import { Submission } from './Submission';
const App = () => {
  return (
    <Layouts.Root>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/submissions" element={<Submission />} />
        <Route path="/form" element={<Form />} />
        <Route path={`/form/:id`} element={<Form />} />
        <Route path="*" element={<Page.Error />} />
      </Routes>
    </Layouts.Root>
  );
};

export { App };
