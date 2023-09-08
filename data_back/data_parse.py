import csv
import json


def parse_cluster(file_path):
    clusters = {}
    with open(file_path, 'r') as f:
        lines = f.readlines()

        cluster_id = None
        for line in lines:
            line = line.strip()
            if "Cluster" in line and "- TOPIC:" in line:
                cluster_id = int(line.split()[1])
                clusters[cluster_id] = {
                    'topic': line.split("- TOPIC:")[1].strip(),
                    'content': []
                }
            elif line and cluster_id is not None:
                item_number = line.split()[0][1:-1]
                text = ' '.join(line.split()[1:])
                clusters[cluster_id]['content'].append({
                    'item_number': item_number,
                    'text': text
                })
    return clusters


def parse_graph(file_path):
    links = []
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['relation'] == 'C':
                links.append(
                    {'source': row['node_i'], 'target': row['node_j']})
            elif row['relation'] == 'E':
                links.append(
                    {'source': row['node_j'], 'target': row['node_i']})
    return links


def create_json(cluster_path, graph_path, output_path):
    clusters = parse_cluster(cluster_path)
    links = parse_graph(graph_path)

    data = {
        'nodes': [{'id': str(k), 'topic': v['topic'], 'content': v['content']} for k, v in clusters.items()],
        'links': links
    }

    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)


# Call the function
create_json("cluster.txt", "graph.csv", "data.json")
