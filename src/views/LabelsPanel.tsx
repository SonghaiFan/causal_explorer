import React, { FC, useEffect, useMemo, useState } from "react";
import { useSigma } from "react-sigma-v2";
import { MdLabel } from "react-icons/md";
import { keyBy, mapValues, sortBy, values } from "lodash";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

import { FiltersState, Label } from "../types";
import Panel from "./Panel";

const LabelsPanel: FC<{
  labels: Label[];
  filters: FiltersState;
  toggleLabel: (label: string) => void;
  setLabels: (labels: Record<string, boolean>) => void;
}> = ({ labels, filters, toggleLabel, setLabels }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerLabel = useMemo(() => {
    const index: Record<string, number> = {};
    graph.forEachNode(
      (_, { label }) => (index[label] = (index[label] || 0) + 1)
    );
    return index;
  }, []);

  const maxNodesPerLabel = useMemo(
    () => Math.max(...values(nodesPerLabel)),
    [nodesPerLabel]
  );
  const visibleLabelsCount = useMemo(
    () => Object.keys(filters.labels).length,
    [filters]
  );

  const [visibleNodesPerLabel, setVisibleNodesPerLabel] =
    useState<Record<string, number>>(nodesPerLabel);
  useEffect(() => {
    requestAnimationFrame(() => {
      const index: Record<string, number> = {};
      graph.forEachNode(
        (_, { label, hidden }) =>
          !hidden && (index[label] = (index[label] || 0) + 1)
      );
      setVisibleNodesPerLabel(index);
    });
  }, [filters]);

  const sortedLabels = useMemo(
    () => sortBy(labels, (label) => -nodesPerLabel[label.key]),
    [labels, nodesPerLabel]
  );

  return (
    <Panel
      title={
        <>
          <MdLabel className="text-muted" /> Labels
          {visibleLabelsCount < labels.length ? (
            <span className="text-muted text-small">
              {" "}
              ({visibleLabelsCount} / {labels.length})
            </span>
          ) : (
            ""
          )}
        </>
      }
    >
      <p>
        <i className="text-muted">
          Click a label to show/hide related pages from the network.
        </i>
      </p>
      <p className="buttons">
        <button
          className="btn"
          onClick={() => setLabels(mapValues(keyBy(labels, "key"), () => true))}
        >
          <AiOutlineCheckCircle /> Check all
        </button>{" "}
        <button className="btn" onClick={() => setLabels({})}>
          <AiOutlineCloseCircle /> Uncheck all
        </button>
      </p>
      <ul>
        {sortedLabels.map((label) => {
          const nodesCount = nodesPerLabel[label.key];
          const visibleNodesCount = visibleNodesPerLabel[label.key] || 0;
          return (
            <li
              className="caption-row"
              key={label.key}
              title={`${nodesCount} page${nodesCount > 1 ? "s" : ""}${
                visibleNodesCount !== nodesCount
                  ? ` (only ${visibleNodesCount} visible)`
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={filters.labels[label.key] || false}
                onChange={() => toggleLabel(label.key)}
                id={`label-${label.key}`}
              />
              <label htmlFor={`label-${label.key}`}>
                <span
                  className="circle"
                  //   style={{ backgroundColor: label.color }}
                />{" "}
                <div className="node-label">
                  <span>{label.key}</span>
                  <div
                    className="bar"
                    style={{
                      width: (100 * nodesCount) / maxNodesPerLabel + "%",
                    }}
                  >
                    <div
                      className="inside-bar"
                      style={{
                        width: (100 * visibleNodesCount) / nodesCount + "%",
                      }}
                    />
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default LabelsPanel;
