import { Card, CardBody } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { IconButtonGroup } from '@strapi/design-system';
import TooltipIconButton from '../TooltipIconButton';
import { ArrowLeft, ArrowRight, Pencil, Trash } from '@strapi/icons';
import { Field as FieldType, useFormContext } from '../../context/FormContext';
import { getTranslation } from '../../utils/getTranslation';
import { useIntl } from 'react-intl';
import { Flex } from '@strapi/design-system';
import FieldPreview from './FieldPreview';
import ResizeIcon from '../Icons/Resize';

function getBlockWidth(width: number) {
  switch (width) {
    case 12:
      return '100%';
    case 8:
      return '66%';
    case 6:
      return '50%';
    case 4:
      return '33%';
    default:
      return width;
  }
}

const FieldCard = ({
  handleEditField,
  block,
  field,
  index,
}: {
  handleEditField: Function;
  block: any;
  field: FieldType;
  index: Number;
}) => {
  const { formatMessage } = useIntl();
  const { currentLayouts, currentBreakpoint, resizeBlock, removeBlock, moveBlock } =
    useFormContext();

  const editField = (block: any) => {
    return handleEditField(block);
  };

  const renderButtons = () => {
    return (
      <IconButtonGroup>
        <TooltipIconButton
          label="Previous"
          onClick={() => moveBlock(block.i, 'prev')}
          disabled={index === 0}
          variant="secondary"
        >
          <ArrowLeft />
        </TooltipIconButton>
        <TooltipIconButton
          label="Next"
          onClick={() => moveBlock(block.i, 'next')}
          disabled={index === currentLayouts[currentBreakpoint].length - 1}
          variant="secondary"
        >
          <ArrowRight />
        </TooltipIconButton>
      </IconButtonGroup>
    );
  };

  return (
    <Card key={block.i} background="neutral100" hasRadius>
      <CardBody alignItems="flex-start" gap={4}>
        <Flex gap={1} alignItems="flex-start" direction="column" style={{ minWidth: '150px' }}>
          <TooltipIconButton
            label="Resize"
            onClick={() => editField(block)}
            variant="secondary"
            disabled={false}
          >
            <Flex gap={1} alignItems="center">
              <Pencil style={{ width: '12px' }} />
              <Typography variant="sigma" lineHeight="16px">
                {formatMessage({
                  id: getTranslation(`forms.fields.types.${field.type}`),
                })}
              </Typography>
            </Flex>
          </TooltipIconButton>
          <TooltipIconButton
            label="Remove"
            onClick={() => removeBlock(block.i)}
            disabled={false}
            variant="danger-light"
          >
            <Flex gap={1} alignItems="center">
              <Trash style={{ width: '12px' }} />
              <Typography variant="sigma" lineHeight="16px">
                {formatMessage({
                  id: getTranslation(`actions.delete`),
                })}
              </Typography>
            </Flex>
          </TooltipIconButton>
        </Flex>
        <Flex gap={2} alignItems="center" justifyContent="space-between" style={{ width: '100%' }}>
          <FieldPreview field={field} />
        </Flex>
        <Flex
          direction="column"
          alignItems="flex-end"
          gap={1}
          style={{ marginLeft: 'auto', minWidth: '64px' }}
        >
          {renderButtons()}
          <TooltipIconButton
            label="Resize"
            onClick={() => resizeBlock(block.i)}
            variant="secondary"
            disabled={false}
          >
            <Flex
              gap={1}
              alignItems="center"
              justifyContent="space-between"
              style={{ width: '100%' }}
            >
              <ResizeIcon width={15} height={15} />
              <Typography variant="sigma" lineHeight="16px">
                {getBlockWidth(block.w)}
              </Typography>
            </Flex>
          </TooltipIconButton>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default FieldCard;
