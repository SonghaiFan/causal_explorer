import React, {
  KeyboardEvent,
  ChangeEvent,
  FC,
  useEffect,
  useState,
} from "react";
import { useSigma } from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";

import { FiltersState } from "../types";

/**
 * This component is basically a fork from React-sigma-v2's SearchControl
 * component, to get some minor adjustments:
 * 1. We need to hide hidden nodes from results
 * 2. We need custom markup
 */
const SearchField: FC<{ filters: FiltersState }> = ({ filters }) => {
  const sigma = useSigma();

  const [search, setSearch] = useState<string>("");
  const [values, setValues] = useState<Array<{ id: string; label: string }>>(
    []
  );
  const [selected, setSelected] = useState<string | null>(null);

  const refreshValues = () => {
    const newValues: Array<{ id: string; label: string }> = [];
    const lcSearch = search.toLowerCase();
    if (!selected && search.length > 1) {
      sigma
        .getGraph()
        .forEachNode((key: string, attributes: Attributes): void => {
          if (
            (!attributes.hidden &&
              attributes.label &&
              attributes.label.toLowerCase().indexOf(lcSearch) === 0) ||
            key.indexOf(lcSearch) === 0
          )
            newValues.push({ id: key, label: attributes.label });
        });
    }
    setValues(newValues);
  };

  // Refresh values when search is updated:
  useEffect(() => refreshValues(), [search]);

  // Refresh values when filters are updated (but wait a frame first):
  useEffect(() => {
    requestAnimationFrame(refreshValues);
  }, [filters]);

  useEffect(() => {
    if (!selected) return;

    sigma.getGraph().setNodeAttribute(selected, "highlighted", true);
    const nodeDisplayData = sigma.getNodeDisplayData(selected);

    if (nodeDisplayData)
      sigma.getCamera().animate(
        { ...nodeDisplayData, ratio: 0.05 },
        {
          duration: 600,
        }
      );

    return () => {
      sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
    };
  }, [selected]);

  const zoomToNode = (node: string) => {
    sigma.getGraph().setNodeAttribute(node, "highlighted", true);
    const nodeDisplayData = sigma.getNodeDisplayData(node);
    if (nodeDisplayData)
      sigma.getCamera().animate(
        { ...nodeDisplayData, ratio: 0.05 },
        {
          duration: 600,
        }
      );
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchString = e.target.value;
    console.log("values", values);
    // find all values that match the search string
    const valueItems = values.filter(
      (value) => value.label === searchString || value.id === searchString
    );

    const valueItem = valueItems.find(
      (value) => value.label === searchString && value.id === searchString
    );

    console.log("valueItem", valueItem);
    console.log("valueItems", valueItems);

    if (valueItems.length === 1) {
      const valueID = valueItem ? valueItem.id : valueItems[0].id;
      setSearch(valueID);
      setSelected(valueID);
      zoomToNode(valueID);
    } else {
      setSelected(null);
      setSearch(searchString);
    }
  };

  return (
    <div className="search-wrapper">
      <input
        type="search"
        placeholder="Search in nodes..."
        list="nodes"
        value={search}
        onChange={onInputChange}
      />
      <BsSearch className="icon" />
      <datalist id="nodes">
        {values.map((value: { id: string; label: string }) => (
          <option key={value.id} value={value.id}>
            {value.label}
          </option>
        ))}
      </datalist>
    </div>
  );
};

export default SearchField;
