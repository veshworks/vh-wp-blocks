import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
  const { sidebarWidth } = attributes;
  const blockProps = useBlockProps.save( {
    className: 'vh-local-sidebar',
    style: { '--vh-sidebar-width': sidebarWidth },
  } );

  return (
    <div { ...blockProps }>
      <div className="vh-local-sidebar__layout">
        <InnerBlocks.Content />
      </div>
    </div>
  );
}
