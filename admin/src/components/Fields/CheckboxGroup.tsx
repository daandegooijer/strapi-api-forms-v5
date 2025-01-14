import Checkbox from './Checkbox';

const CheckboxGroup = ({ ...props }: { options: { label: string }[] }) => {
  if (!props.options) {
    return <></>;
  }

  return (
    <>
      {props.options.map((option: any, index: number) => (
        <Checkbox key={index} {...option} disabled={true} />
      ))}
    </>
  );
};

export default CheckboxGroup;
