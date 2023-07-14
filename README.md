# Causal Relationship Network Visualization

This project is a web-based application that visualizes a network of causal relationships between sentences. The aim of the project is to provide a visual representation of the complex web of cause-and-effect relationships present in a given source material. The network is generated using state-of-the-art natural language processing techniques to cluster sentences and identify causal relationships between them.

## Technologies Used

The project is built using the following technologies:

- React: A JavaScript library for building user interfaces.
- TypeScript: A statically typed superset of JavaScript that adds optional types to the language, enhancing its robustness and maintainability.
- Sigma.js: A JavaScript library for visualizing networks and graphs.
- Natural Language Processing (NLP) techniques: Advanced NLP algorithms are used to cluster sentences and detect causal relationships.

## Key Features

1. **Key and Categories:** Each cluster in the graph now includes a "key" and "category" to aid in understanding and navigation. The "key" represents the most significant word within the cluster, while the "category" provides a broader topic classification. The predefined categories are as follows:
   - Cognitive Behavior
   - Emotional Behavior
   - Social Behavior
   - Physical Behavior
   - Health-related Behavior
   - Economic Behavior
2. **Node Sizes and Betweenness Centrality:** Node sizes in the graph are proportional to their betweenness centrality, indicating their importance as pivotal points in the network.
3. **Powerful Search Functionality:** The updated app includes a robust search feature that allows you to search by keywords or cluster IDs. Simply enter your search query, and the corresponding node will be zoomed into view.
4. **Filtering Options:** You can now filter the graph by categories, labels (keys), and cluster IDs. This feature enables different team members to focus on specific subsets of tasks more efficiently.
5. **Tooltip and Highlighting:** Hovering over a node will display a tooltip with relevant information, while connected edges are highlighted for better visualization.
6. **Persistent Node State:** Once a node is clicked, its state will be retained until you click on the empty canvas area.

## Usage

To use the application, follow these steps:

1. Clone the GitHub repository: `git clone https://github.com/SonghaiFan/causal_explorer.git`
2. Navigate to the project directory.
3. Install the dependencies: `npm install`
4. Start the application: `npm start`
5. Open your web browser and go to `http://localhost:3000` to access the application.

Or just click <https://songhaifan.github.io/causal_explorer/>

## Customization

The application can be customized to work with different datasets or to incorporate additional features. Here are some possible customization options:

- Data Source: Modify the data source to load a different set of sentences and their causal relationships. This could involve reading data from a file, connecting to an API, or integrating with a database.
- Visualization Styles: Customize the appearance of the network visualization by modifying the styles, colors, and layouts used by Sigma.js.
- Additional Features: Enhance the application with additional features such as search functionality, filtering options, or the ability to save and load networks.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute the code in this project for both commercial and non-commercial purposes.

## Acknowledgements

This project was made possible by utilizing several open-source libraries and technologies. We would like to acknowledge and express our gratitude to the developers and contributors of the following projects:

- React
- Sigma.js
- React Sigma
- Natural Language Processing libraries and tools used for clustering and causal relationship detection.

## Contact

If you have any questions or inquiries about this project, please contact [Songhai Fan](mailto:songhai.fan@monash.edu). We appreciate your interest and welcome any feedback you may have.
