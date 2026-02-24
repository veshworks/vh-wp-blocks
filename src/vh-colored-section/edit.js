import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps( { className: 'vh-colored-section' } );
  return (
    <div { ...blockProps }>
      <InnerBlocks />
    </div>
  );
}
