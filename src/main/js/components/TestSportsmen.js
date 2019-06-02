import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { loadSporsmenDispatch, sportsmenSelector } from '../redux/sportsmen'

class TestSportsmen extends Component {
    componentDidMount () {
        const { loadSporsmen } = this.props;
        loadSporsmen();
    }
    render () {
        const { sportsmen } = this.props;
        console.log(sportsmen);
        return <Fragment />;
    }
}

TestSportsmen.propTypes = {
    loadSporsmen: PropTypes.func,
    sportsmen: PropTypes.array
};

const mapStateToProps = state => ({
    sportsmen: sportsmenSelector(state)
});

const mapDispatchToProps = dispatch => ({
    loadSporsmen: () => dispatch(loadSporsmenDispatch())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TestSportsmen);
