import React, { FC } from "react";
import { BsFillChatLeftTextFill } from "react-icons/bs";

import Panel from "./Panel";

const InformationPanel: FC = () => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsFillChatLeftTextFill className="text-muted" /> Information
        </>
      }
    >
      <p>This is space for information</p>
    </Panel>
  );
};

export default InformationPanel;
