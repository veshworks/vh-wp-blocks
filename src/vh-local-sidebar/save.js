import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
  const { sidebarWidth, columnsTemplate } = attributes;
  const blockProps = useBlockProps.save( {
    className: 'vh-local-sidebar',
    style: {
      '--vh-columns-template': columnsTemplate || `1fr ${ sidebarWidth }`,
    },
  } );

  return (
    <div { ...blockProps }>
      <div className="vh-local-sidebar__layout">
        <InnerBlocks.Content />
      </div>
    </div>
  );
}
