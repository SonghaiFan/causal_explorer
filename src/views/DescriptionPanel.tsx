import React, { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC = () => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsInfoCircle className="text-muted" /> Description
        </>
      }
    >
      <p>
        This map represents a <i>network</i> of causal relationships. Each{" "}
        <i>node</i> represents a cluster of sentences, and each edge a detected
        causal relation between them.
      </p>
      <p>
        The clusters were formed using a state-of-the-art natural language
        processing technique, and the causal relationships were identified based
        on patterns and cues that often indicate causation in written text. The
        resultant network provides a visual representation of the complex web of
        cause-and-effect relationships present in the source material.
      </p>
      <p>
        Nodes sizes are related to their{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Betweenness_centrality"
        >
          betweenness centrality
        </a>
        . More central nodes (ie. bigger nodes) are important crossing points in
        the network. You can click a node to expand and explore the sentences
        contained within each cluster.
      </p>
    </Panel>
  );
};

export default DescriptionPanel;
