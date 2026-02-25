import { useBlockProps, InnerBlocks, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
  const { backgroundColor } = attributes;
  const blockProps = useBlockProps( {
    className: 'vh-colored-section',
    style: { '--vh-section-bg': backgroundColor },
  } );

  return (
    <>
      <InspectorControls>
        <PanelColorSettings
          title="Color Settings"
          colorSettings={ [
            {
              value: backgroundColor,
              onChange: ( value ) => setAttributes( { backgroundColor: value } ),
              label: 'Background Color',
            },
          ] }
        />
      </InspectorControls>
      <div { ...blockProps }>
        <InnerBlocks />
      </div>
    </>
  );
}
