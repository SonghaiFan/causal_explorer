import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useState, useEffect } from "react";
import { set } from "lodash";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{
  setHoveredNode: (node: string | null) => void;
}> = ({ setHoveredNode, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();
  const [clicked, setClicked] = useState(false);

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        if (!graph.getNodeAttribute(node, "hidden")) {
          const content = graph.getNodeAttribute(node, "textContent");
          setClicked(true);
          setHoveredNode(node);
          console.log(content);
        }
      },
      clickStage() {
        setHoveredNode(null);
        setClicked(false);
        console.log("Canvas was clicked with no node or edge under the cursor");
      },
      enterNode({ node }) {
        if (!clicked) {
          setHoveredNode(node);
        }
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      leaveNode() {
        if (!clicked) {
          setHoveredNode(null);
        }
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      },
    });
  }, [clicked]);

  return <>{children}</>;
};

export default GraphEventsController;
