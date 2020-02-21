import React, { Component } from 'react';
import Client from '../MinervaClient';
import TreeNode from './TreeNode';
import '../css/Tree.css';
import ContextMenu from './ContextMenu';

class RepositoryTree extends Component {

    constructor(props) {
        super(props);

        this.loadChildren = this.loadChildren.bind(this);
        this.closeNode = this.closeNode.bind(this);
        this.select = this.select.bind(this);
        this.openContextMenu = this.openContextMenu.bind(this);
        this.onContextMenuClosed = this.onContextMenuClosed.bind(this);

        this.state = {
            rootNode: null,
            selected: null,
            context: null,
            contextClass: ''
        }

        this.refreshRepositories(); 
    }

    refreshRepositories() {
        if (!Client.loggedIn()) {
            this.setState({rootNode: null});
            return;
        }
        Client.getRepositories().then(repos => {
            console.log(repos);
            let repositories = [];
            for (let repo of repos.included.repositories) {
                console.log(repo);
                repositories.push({
                    type: 'repository',
                    uuid: repo.uuid,
                    key: repo.uuid,
                    title: repo.name,
                    isLeaf: false,
                    description: 'Repository',
                    level: 1,
                    expanded: false,
                    color: 'primary'
                });
            }
            console.log(repos);
            let rootNode = {
                root: true,
                children: repositories,
                level: 1
            }
            this.setState({ rootNode: rootNode });
        }).catch(err => {
            console.error(err);
        });
    }

    loadChildren(node, onFinished) {
        console.log('load children ', node);
        if (node.leaf) {
            return;
        }
        let loadFunction = null;
        if (node.type === 'repository') {
            loadFunction = this.loadImagesInRepository;
        } else if (node.type === 'fileset') {
            loadFunction = this.loadImages;
        }
        if (!loadFunction) {
            console.warn('Invalid node type ', node.type);
            return;
        }
        loadFunction(node).then(res => {
            
            node.children = [];
            node.children = node.children.concat(res);
            node.expanded = true;
            onFinished();
            console.log(node.children);
            this.forceUpdate();
        });
    }

    loadImagesInRepository(node) {
        return new Promise((resolve, reject) => {
            Client.listImagesInRepository(node.uuid).then(response => {
                let images = [];
                let id = 0;
                for (let image of response.data) {
                    id++;
                    images.push({
                        type: 'image',
                        id: id,
                        title: image.name,
                        uuid: image.uuid,
                        leaf: true,
                        level: node.level + 1,
                        color: 'secondary',
                        data: image
                    });
                }
                resolve(images);
            });
        });
    }

    // loadFilesets(node) {
    //     return new Promise((resolve, reject) => {
    //         Client.listImportsInRepository(node.uuid).then(response => {
    //             let filesets = [];
    //             let promises = [];
    //             for (let imp of response.data) {
    //                 let id = 0;
    //                 let loadFilesets = Client.listFilesetsInImport(imp.uuid);
    //                 promises.push(loadFilesets);
    //                 loadFilesets.then(response => {
    //                     for (let fileset of response.data) {
    //                         id++;
    //                         filesets.push({
    //                             type: 'fileset',
    //                             uuid: fileset.uuid,
    //                             id: id,
    //                             title: fileset.name,
    //                             children: [],
    //                             level: node.level + 1,
    //                             color: 'info'
    //                         });
    //                     }
    //                 });
    //             }
    //             Promise.all(promises).then(() => {
    //                 resolve(filesets);
    //             });
    //         });
    //     });
    // }

    // loadImages(node) {
    //     return new Promise((resolve, reject) => {
    //         Client.listImagesInFileset(node.uuid).then(response => {
    //             let images = [];
    //             let id = 0;
    //             for (let image of response.data) {
    //                 id++;
    //                 images.push({
    //                     type: 'image',
    //                     id: id,
    //                     title: image.name,
    //                     uuid: image.uuid,
    //                     leaf: true,
    //                     level: node.level + 1,
    //                     color: 'secondary',
    //                     data: image
    //                 });
    //             }
    //             resolve(images);
    //         });
    //     });
    // }

    closeNode(node) {
        node.expanded = false;
        node.children = [];
        this.forceUpdate();
    }

    select(node) {
        console.log('Node selected ', node);
        this.setState({selected: node});
        this.props.onSelect(node);
    }

    onContextMenuClosed() {
        this.setState({context: null});
    }

    onDeleted() {

    }

    openContextMenu(node, ref) {
        console.log(ref);
        var rect = ref.current.getBoundingClientRect();
        this.setState({context: node, contextLeft: rect.left, contextTop: rect.top + 30});
    }

    render() {
        
        return (
            <div className="treeRoot">
                <TreeNode node={this.state.rootNode} onExpand={this.loadChildren} onClose={this.closeNode} onSelect={this.select} onOpenContextMenu={this.openContextMenu}></TreeNode>
                <ContextMenu className={this.state.contextClass} node={this.state.context} onDeleted={this.onDeleted} onClosed={this.onContextMenuClosed} left={this.state.contextLeft} top={this.state.contextTop}/>
            </div>
        );
    }

}

export default RepositoryTree;