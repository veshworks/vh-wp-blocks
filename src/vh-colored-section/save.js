import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
  const { backgroundColor } = attributes;
  const blockProps = useBlockProps.save( {
    className: 'vh-colored-section',
    style: { '--vh-section-bg': backgroundColor },
  } );
  return (
    <div { ...blockProps }>
      <InnerBlocks.Content />
    </div>
  );
}
