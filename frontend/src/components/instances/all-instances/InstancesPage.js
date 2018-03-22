import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import styled from 'styled-components';
// import pick from 'lodash/pick';

// import * as actions from '../../../actions/loadInstancesActions';
import {saveSelectedInstances} from '../../../actions/selectboxInstancesActions';
import InstancesList from "./InstancesList";
import SearchBar from './SearchBar';
import Pagination from '../../common/Pagination';

const CenteredPag = styled.div`
    display: flex;
    justify-content: center;
`;

class InstancesPage extends PureComponent {
    state = {
        items: this.props.instances.instances || [],
        showingItems: this.props.instances.instances || [],
        pageOfItems: [],
        tags: this.props.tags || [],
        currentTagValue: this.props.instances.selectedInstances || {},
    };

    componentDidMount() {
        const {items,tags,currentTagValue} = this.state;
        if (items.length > 0) {
            this.handleTagChange(currentTagValue);


            // When the user navigated out of this page and back in, reset the tags
            if (tags.length < items.length) {
                this.setState({tags: items.map(e => ({value: e.id, label: e.name}))})
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let newState = {};
        let callTagChange;
        const {instances} = this.props;

        // If instances were loaded, set items, paginationed items and select box tags
        if (instances.instances !== nextProps.instances.instances) {
            Object.assign(newState, {
                items: nextProps.instances.instances,
                showingItems: nextProps.instances.instances,
                tags: nextProps.instances.instances.map(e => ({value: e.id, label: e.name})),
            });
            callTagChange = true;
        }

        if (instances.selectedInstances !== nextProps.instances.selectedInstances) {
            Object.assign(newState, {
                currentTagValue: nextProps.instances.selectedInstances,
            });
        }
        this.setState(newState, () => {
            if (callTagChange && this.state.currentTagValue) this.handleTagChange(this.state.currentTagValue)
        });
    }

    onChangePage = (pageOfItems) => this.setState({pageOfItems: pageOfItems}); // update state with new page of items

    // When a user select a tag from the selectbox, show him only relevant instances
    handleTagChange = (selectedOption) => {
        const {currentTagValue, items} = this.state;

        const tagValues = selectedOption.map(e => e.value.toLowerCase());
        const filteredItems = tagValues.length
            ? items.filter(e => Object.values(e).map(e => "string" === typeof e ? e.toLowerCase() : e).some(e => tagValues.some(t => "string" === typeof e && -1 !== e.indexOf(t))))
            : items;

        this.setState({currentTagValue: selectedOption, showingItems: filteredItems});
        if (selectedOption !== currentTagValue) {
            this.props.saveSelectedInstances(selectedOption);
        }
    };

    render() {
        const {currentTagValue, tags, pageOfItems, showingItems} = this.state;
        return (
            <div>
                <SearchBar
                    tags={tags}
                    handleTagChange={this.handleTagChange}
                    currentTagValue={currentTagValue}/>
                <InstancesList
                    instances={pageOfItems}
                    match={this.props.match}/>
                <CenteredPag>
                    <Pagination
                        items={showingItems}
                        onChangePage={this.onChangePage}/>
                </CenteredPag>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        instances: {instances: state.instances.instances, selectedInstances: state.instances.selectedInstances},
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // actions: bindActionCreators(actions, dispatch),
        saveSelectedInstances: bindActionCreators(saveSelectedInstances, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstancesPage);