import { Checkbox as StrapiCheckbox } from '@strapi/design-system';
const Checkbox = ({ ...props }: { label: string }) => {
  return <StrapiCheckbox {...props}>{props.label}</StrapiCheckbox>;
};

export default Checkbox;
