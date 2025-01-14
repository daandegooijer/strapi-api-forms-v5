import { Radio } from '@strapi/design-system';

const RadioGroup = ({ ...props }: { options: { label: string }[] }) => {
  if (!props.options) {
    return <></>;
  }

  return (
    <Radio.Group>
      {props.options.map((option) => {
        return (
          <Radio.Item checked={false} disabled>
            {option.label}
          </Radio.Item>
        );
      })}
    </Radio.Group>
  );
};

export default RadioGroup;
