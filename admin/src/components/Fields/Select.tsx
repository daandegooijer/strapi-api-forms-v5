import { SingleSelect, SingleSelectOption } from '@strapi/design-system';

const Select = ({ ...props }: { options: { label: string }[] }) => {
  return (
    <SingleSelect {...props}>
      {props.options.map((option: any, index: number) => (
        <SingleSelectOption key={index} value={option.label}>
          {option.label}
        </SingleSelectOption>
      ))}
    </SingleSelect>
  );
};

export default Select;
