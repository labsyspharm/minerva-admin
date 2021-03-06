import React from 'react';
import Client from '../MinervaClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'

class RepositorySelect extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            repositories: [],
            repository: null
        };
    }

    componentDidMount() {
        this.loadRepositories();
    }

    refresh() {
        this.loadRepositories();
    }

    loadRepositories() {
        Client.getRepositories().then(res => {
            let repositories = [];
            repositories = repositories.concat(res.included.repositories);
            this.setState({ repositories: repositories });
        });
    }

    selectRepository(item) {
        this.setState({ repository: item });
        this.props.onSelect(item);
    }

    render() {
        let repositoryText = 'Select Repository';
        if (this.state.repository) {
            repositoryText = this.state.repository.name;
        }

        return (
            <span className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="repositoryDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {repositoryText}
                </button>
                {this.renderRepositoryChoices()}
            </span>
        )
    }

    renderRepositoryChoices() {
        let choices = this.state.repositories.map((item, index) =>
            <a href="#" className="dropdown-item" onClick={() => this.selectRepository(item)} key={index}>
                <FontAwesomeIcon className="mr-2" icon={faDatabase} />
                {item.name}
            </a>
        );
        return (
            <span className="dropdown-menu" aria-labelledby="repositoryDropdown">
                {choices}
            </span>
        );
    }
}

export default RepositorySelect;