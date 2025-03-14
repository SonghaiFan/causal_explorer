import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

import { drawHover } from "../canvas-utils";
import useDebounce from "../use-debounce";

const NODE_FADE_COLOR = "#bbb";
const EDGE_FADE_COLOR = "#eee";

const GraphSettingsController: FC<{ hoveredNode: string | null }> = ({
  children,
  hoveredNode,
}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  // Here we debounce the value to avoid having too much highlights refresh when
  // moving the mouse over the graph:
  const debouncedHoveredNode = useDebounce(hoveredNode, 10);

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    sigma.setSetting("hoverRenderer", (context, data, settings) =>
      drawHover(
        context,
        { ...sigma.getNodeDisplayData(data.key), ...data },
        settings
      )
    );
  }, [sigma, graph]);

  /**
   * Update node and edge reducers when a node is hovered, to highlight its
   * neighborhood:
   */
  useEffect(() => {
    const hoveredColor: string = debouncedHoveredNode
      ? graph.getNodeAttribute(debouncedHoveredNode, "color")
      : "";

    let neighbors: string[] = [];

    if (debouncedHoveredNode && graph.hasNode(debouncedHoveredNode)) {
      neighbors = graph.neighbors(debouncedHoveredNode);
    }

    console.log("neighbors", neighbors);

    sigma.setSetting(
      "nodeReducer",
      debouncedHoveredNode
        ? (node, data) =>
            node === debouncedHoveredNode ||
            graph.hasEdge(node, debouncedHoveredNode) ||
            graph.hasEdge(debouncedHoveredNode, node)
              ? { ...data, stroke: "black", zIndex: 1 }
              : {
                  ...data,
                  zIndex: 0,
                  label: "",
                  color: NODE_FADE_COLOR,
                  image: null,
                  highlighted: false,
                }
        : null
    );

    sigma.setSetting(
      "edgeReducer",
      debouncedHoveredNode
        ? (edge, data) => {
            // Check if edge has hovered node as extremity
            if (graph.hasExtremity(edge, debouncedHoveredNode)) {
              return { ...data, color: hoveredColor, size: 2 };
            }

            // Check if edge has any neighbor node as extremity
            for (let node of neighbors) {
              if (graph.hasExtremity(edge, node)) {
                return { ...data };
              }
            }

            // If edge does not satisfy above conditions, hide it
            return { ...data, color: EDGE_FADE_COLOR, hidden: true };
          }
        : null
    );
  }, [debouncedHoveredNode]);

  return <>{children}</>;
};

export default GraphSettingsController;
