import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';

// import * as actions from '../../../actions/loadInstancesActions';
import { saveSelectedInstances } from '../../../actions/selectboxInstancesActions';
import InstancesList from "./InstancesList";
import SearchBar from './SearchBar';
import Pagination from '../../common/Pagination';
import DisplayOptions from "./DisplayOptions";
import { changeListType, changeShowingItems } from "../../../actions/viewTypeActions";
import GoUp from "../../common/GoUp";

const CenteredPag = styled.div`
    display: flex;
    justify-content: center;
`;

class InstancesPage extends PureComponent {
  state = {
    items: this.props.instances.instances || [],
    showingItems: this.props.instances.instances || [],
    availableNumberOfDisplayedItems: [10, 30, 50, 100, 999],
    pageOfItems: [],
    tags: this.props.tags || [],
    currentTagValue: this.props.instances.selectedInstances || {},
    alreadySorted: { field: '', dir: '' }
  };

  componentDidMount() {
    const { items, tags, currentTagValue } = this.state;
    if (items.length > 0) {
      this.handleTagChange(currentTagValue);


      // When the user navigated out of this page and back in, reset the tags
      if (tags.length < items.length) {
        this.setState({ tags: items.map(e => ({ value: e.id, label: e.name })) })
      }
    }
  }

  static getDerivedStateFromProps(nextProps) {
    let newState = {};
    let callTagChange;
    const { instances } = this.props;

    // If instances were loaded, set items, paginationed items and select box tags
    if (instances.instances !== nextProps.instances.instances) {
      Object.assign(newState, {
        items: nextProps.instances.instances,
        showingItems: nextProps.instances.instances,
        tags: nextProps.instances.instances.map(e => ({ value: e.id, label: e.name })),
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

  onChangePage = pageOfItems => this.setState({ pageOfItems: pageOfItems }); // update state with new page of items

  // When a user select a tag from the selectbox, show him only relevant instances
  handleTagChange = selectedOption => {
    const { currentTagValue, items } = this.state;

    const tagValues = selectedOption.map(e => e.value.toLowerCase());
    const filteredItems = tagValues.length
      ? items.filter(e => Object.values(e).map(e => "string" === typeof e ? e.toLowerCase() : e).some(e => tagValues.some(t => "string" === typeof e && -1 !== e.indexOf(t))))
      : items;

    this.setState({ currentTagValue: selectedOption, showingItems: filteredItems });
    if (selectedOption !== currentTagValue) {
      this.props.saveSelectedInstances(selectedOption);
    }
  };

  onDisplayItemsChange = selectedOption => this.props.changeShowingItems(parseInt(selectedOption.target.value));

  onChangeListType = selectedView => {
    const target = selectedView.target.tagName === 'I' ? selectedView.target.parentElement : selectedView.target;
    this.props.changeListType(target.value);
  };

  sortCol = event => {
    const col = event.currentTarget.id;
    const { alreadySorted, showingItems } = this.state;
    let newDir = 'asc';
    alreadySorted.field === col && alreadySorted.dir === "asc" && (newDir = "desc");
    const orderedItems = orderBy(showingItems, col, newDir);
    this.setState({ alreadySorted: { field: col, dir: newDir }, showingItems: orderedItems })
  };

  render() {
    const { currentTagValue, tags, pageOfItems, availableNumberOfDisplayedItems, showingItems, alreadySorted } = this.state;
    const { listType, numberOfDisplayedItems } = this.props;
    return (
      <div>
        <GoUp/>
        <SearchBar
          tags={tags}
          handleTagChange={this.handleTagChange}
          currentTagValue={currentTagValue}/>
        <DisplayOptions
          currentlySelectedNumberOfDisplayedItems={numberOfDisplayedItems}
          availableNumberOfDisplayedItems={availableNumberOfDisplayedItems}
          changeNumOfItems={this.onDisplayItemsChange}
          changeListType={this.onChangeListType}
          currentlySelectedListType={listType}/>
        <InstancesList
          instances={pageOfItems}
          match={this.props.match}
          listType={listType}
          sortFunc={this.sortCol}
          alreadySorted={alreadySorted}/>
        <CenteredPag>
          <Pagination
            maxItems={numberOfDisplayedItems}
            items={showingItems}
            onChangePage={this.onChangePage}/>
        </CenteredPag>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    instances: { instances: state.instances.instances, selectedInstances: state.instances.selectedInstances },
    listType: state.viewType.listType,
    numberOfDisplayedItems: state.viewType.showingItems,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveSelectedInstances: bindActionCreators(saveSelectedInstances, dispatch),
    changeListType: bindActionCreators(changeListType, dispatch),
    changeShowingItems: bindActionCreators(changeShowingItems, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstancesPage);