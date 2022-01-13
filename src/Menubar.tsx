import React from 'react';

interface EditorMenuProps {
  onSave: () => void;
}

function Menubar(props: EditorMenuProps) {
  return (
    <>
      <button onClick={props.onSave}>SV</button>
      <button /*onClick={props.onCreateNewProject}*/>NP</button>
      <button /*onClick={props.onOpenSettings}*/>ST</button>

    </>
  );
}


export default Menubar;
