import { useEffect, useState } from 'react';
import { useYooptaEditor } from '../../contexts/UltraYooptaContext/UltraYooptaContext';
import { ToolbarComponent } from './component';
import { useFloating, offset, flip, shift, inline, autoUpdate, FloatingPortal } from '@floating-ui/react';
import throttle from 'lodash/throttle';

const Toolbar = () => {
  const editor = useYooptaEditor();
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    open: isToolbarOpen,
    onOpenChange: setIsToolbarOpen,
    middleware: [inline(), flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  });

  const handleSelectionChange = () => {
    const domSelection = window.getSelection();
    if (!domSelection || domSelection?.isCollapsed) return setIsToolbarOpen(false);

    const domRange = domSelection.getRangeAt(0);
    const selectionRect = domRange.getBoundingClientRect();
    const text = domRange.toString().trim();

    const yooptaEditorEl = document.getElementById('yoopta-editor');
    const ancestor = domRange?.commonAncestorContainer;

    if (!yooptaEditorEl?.contains(ancestor)) return setIsToolbarOpen(false);

    if (domRange && text.length > 0 && !yooptaEditorEl?.contains(ancestor)) {
      refs.setReference({
        getBoundingClientRect: () => selectionRect,
        getClientRects: () => domRange.getClientRects(),
      });

      setIsToolbarOpen(true);
    }
  };

  const onSelectionChange = throttle(handleSelectionChange, 100);

  useEffect(() => {
    window.document.addEventListener('selectionchange', onSelectionChange);
    return () => window.document.removeEventListener('selectionchange', onSelectionChange);
  }, [editor.selectedBlocks]);

  if (!isToolbarOpen) return null;

  const currentBlock = Object.values(editor.blocks).find((block) => block.isActive());

  return (
    <FloatingPortal>
      <div style={floatingStyles} ref={refs.setFloating}>
        <ToolbarComponent activeBlock={currentBlock} editor={editor} />
      </div>
    </FloatingPortal>
  );
};

export { Toolbar };
