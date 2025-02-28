import csv
import json
import re
import random


def parse_cluster(file_path):
    """Parse the clusters file to extract cluster information."""
    clusters = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

        cluster_id = None
        for line in lines:
            line = line.strip()
            if "Index" in line and "Cluster" in line and "topic" in line:
                # Extract cluster ID from format "Index X - Cluster Y - topic : Z"
                # The cluster ID is Y, not X
                match = re.search(r'Cluster (\d+) - topic : (.+)', line)
                if match:
                    cluster_id = int(match.group(1))
                    topic = match.group(2)
                    clusters[cluster_id] = {
                        'topic': topic,
                        'content': []
                    }
            elif line and cluster_id is not None and "(" in line and ")" in line:
                # Extract item number and text
                item_match = re.match(r'\(([^)]+)\) (.+)$', line)
                if item_match:
                    item_number = item_match.group(1)
                    text = item_match.group(2)
                    clusters[cluster_id]['content'].append({
                        'item_number': item_number,
                        'text': text
                    })
    return clusters


def parse_graph(file_path):
    """Parse the graph CSV file to extract relationships between clusters."""
    links = []
    connected_nodes = set()  # Track connected nodes
    
    # Keep track of edges to avoid duplicates
    edge_set = set()
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row

        for row in reader:
            if len(row) < 3:
                continue
                
            # Extract cluster IDs from format "(ID) topic : description"
            match_a = re.search(r'\((\d+)\) topic', row[0].strip())
            match_b = re.search(r'\((\d+)\) topic', row[1].strip())

            if match_a and match_b:
                id_a = match_a.group(1).strip()
                id_b = match_b.group(1).strip()

                # Add the ids to the connected nodes set
                connected_nodes.update([id_a, id_b])

                # Determine the type of relation and set source/target
                relation = row[2].strip()
                
                # Create edges based on relation type, avoiding duplicates
                if relation == 'C':
                    edge_key = f"{id_a}->{id_b}"
                    if edge_key not in edge_set:
                        links.append({'source': id_a, 'target': id_b})
                        edge_set.add(edge_key)
                elif relation == 'E':
                    edge_key = f"{id_b}->{id_a}"
                    if edge_key not in edge_set:
                        links.append({'source': id_b, 'target': id_a})
                        edge_set.add(edge_key)
                elif relation == 'B':  # Bidirectional - add only one direction for visualization
                    edge_key = f"{id_a}->{id_b}"
                    if edge_key not in edge_set:
                        links.append({'source': id_a, 'target': id_b})
                        edge_set.add(edge_key)

    return links, connected_nodes


def create_json(cluster_path, graph_path, output_path):
    """Create the final JSON file combining cluster and graph data."""
    clusters = parse_cluster(cluster_path)
    links, connected_nodes = parse_graph(graph_path)
    
    # Check for missing nodes in the connection pairs
    all_cluster_ids = set(str(k) for k in clusters.keys())
    missing_nodes = connected_nodes - all_cluster_ids
    if missing_nodes:
        print(f"Warning: The following nodes are referenced in the graph but not found in clusters: {missing_nodes}")
    
    # Check for nodes that are in clusters but not connected
    unconnected_nodes = all_cluster_ids - connected_nodes
    if unconnected_nodes:
        print(f"Info: {len(unconnected_nodes)} nodes are in clusters but not connected in the graph")
        print(f"First 10 unconnected nodes: {list(unconnected_nodes)[:10]}")
    
    # Only include nodes that are in the connected_nodes set
    nodes = [
        {
            'id': str(k),
            'topic': v['topic'],
            'content': v['content'],
            'category': 'Default Behaviour'  # Adding a default category
        } 
        for k, v in clusters.items() if str(k) in connected_nodes
    ]
    
    # Check for missing nodes in links
    node_ids = set(node['id'] for node in nodes)
    missing_in_links = set()
    for link in links:
        if link['source'] not in node_ids:
            missing_in_links.add(link['source'])
        if link['target'] not in node_ids:
            missing_in_links.add(link['target'])
    
    if missing_in_links:
        print(f"Warning: The following nodes are referenced in links but not found in the final nodes list: {missing_in_links}")

    data = {
        'nodes': nodes,
        'links': links
    }

    # Final check for edge-node consistency
    edge_keys = {key for link in links for key in [link['source'], link['target']]}
    nodes_keys = {node['id'] for node in nodes}
    missing_keys = nodes_keys - edge_keys
    if missing_keys:
        print(f"Warning: {len(missing_keys)} nodes are not connected to any edge")
        print(f"First 10 disconnected nodes: {list(missing_keys)[:10]}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully created JSON with {len(nodes)} nodes and {len(links)} links")
    return data


def calculate_score(nodes, edges):
    """Calculate centrality scores for nodes."""
    try:
        import networkx as nx
        
        G = nx.Graph()
        for node in nodes:
            G.add_node(node['key'])

        for edge in edges:
            G.add_edge(*edge)

        centrality = nx.betweenness_centrality(G)
        for node in nodes:
            if node['key'] in centrality:
                node['score'] = centrality[node['key']]
            else:
                node['score'] = 0
    except ImportError:
        print("NetworkX not available. Assigning random scores.")
        for node in nodes:
            node['score'] = random.random()
            
    return nodes


def calculate_layout(nodes, edges):
    """Calculate layout positions for nodes."""
    try:
        import networkx as nx
        
        G = nx.Graph()
        for node in nodes:
            G.add_node(node['key'])

        for edge in edges:
            G.add_edge(*edge)

        pos = nx.spring_layout(G, k=0.15, iterations=50, seed=42)
        for node in nodes:
            if node['key'] in pos:
                node['x'], node['y'] = pos[node['key']]
            else:
                # Assign random position if node is not in the layout
                node['x'], node['y'] = random.random(), random.random()
    except ImportError:
        print("NetworkX not available. Assigning random positions.")
        for node in nodes:
            node['x'], node['y'] = random.random(), random.random()
            
    return nodes


def json_to_dataset(json_data, default_cluster_color='#6c3e81', default_tag_image='unknown.svg'):
    """Convert the JSON data to the dataset format required for visualization."""
    # Define color palette
    tableau_20 = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', 
                  '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', 
                  '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', 
                  '#17becf', '#9edae5']
    
    # Prepare data structures
    dataset = {
        'nodes': [],
        'edges': [],
        'clusters': [],
        'tags': [],
        'labels': [],
    }
    clusters = {}
    tags = set()
    labels = set()

    # Prepare color assignment for tags
    tag_colors = {}

    # Create nodes
    for node in json_data['nodes']:
        text_contents = [item['text'] for item in node['content']]
        
        # Assign a color from the palette based on the tag
        if node['category'] not in tag_colors:
            tag_colors[node['category']] = tableau_20[len(tag_colors) % len(tableau_20)]

        dataset['nodes'].append({
            'key': str(node['id']),
            'label': node['topic'],
            'tag': node['category'],  # Use category as tag
            'URL': '',  # URL is not provided in the initial data
            'cluster': node['id'],
            'textContent': node['content'],
        })

        # Add a unique cluster for each node
        dataset['clusters'].append({
            'key': str(node['id']),
            'color': tag_colors[node['category']],  # Cluster color depends on the tag
            'clusterLabel': node['topic'],
            'clusterTextContent': text_contents  # Add text contents to the cluster
        })

        clusters[str(node['id'])] = node['topic']
        labels.add(node['topic'])
        tags.add(node['category'])

    # Create edges
    for link in json_data['links']:
        source = str(link['source'])
        target = str(link['target'])
        # check if the source and target nodes exist
        if source in clusters and target in clusters:
            # 50% of the time, the edge is not added (for visualization clarity)
            if random.random() > 0.5:
                dataset['edges'].append([source, target])
        else:
            print(f"Edge between {source} and {target} is not added because one of the nodes does not exist.")

    # Calculate layout
    dataset['nodes'] = calculate_layout(dataset['nodes'], dataset['edges'])

    # Create tags
    for tag in tags:
        dataset['tags'].append({
            'key': tag,
            'image': default_tag_image,
        })

    # Create labels
    for label in labels:
        dataset['labels'].append({
            'key': label,
            'image': default_tag_image,
        })

    # Calculate scores
    dataset['nodes'] = calculate_score(dataset['nodes'], dataset['edges'])

    return dataset


if __name__ == "__main__":
    # Create the JSON data
    json_data = create_json("data_back/cluster/clusters_final.txt", 
                           "data_back/graph/graph_final.csv", 
                           "data_back/data/data_final_1.json")
    
    # Convert to dataset format
    dataset = json_to_dataset(json_data)
    
    # Save the dataset
    with open("public/dataset.json", 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully created dataset with {len(dataset['nodes'])} nodes and {len(dataset['edges'])} edges")
