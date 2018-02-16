import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addRecipe, removeFromCalendar } from '../actions'
import { capitalize } from '../utils/helpers'
import CalendarIcon from 'react-icons/lib/fa/calendar-plus-o'
import Modal from 'react-modal'
import ArrowRightIcon from 'react-icons/lib/fa/arrow-circle-right'
import Loading from 'react-loading'
import { fetchRecipes } from '../utils/api'
import FoodList from './FoodList'
import ShoppingList from './ShoppingList'

class App extends Component {
  state = {
    foodModalOpen: false,
    meal: null,
    day: null,
    food: null,
  }

  // Prevents console errors
  componentWillMount() {
    Modal.setAppElement('body');
  }

  openFoodModal = ({ meal, day }) => {
    this.setState(() => ({
      foodModalOpen: true,
      meal,
      day,
    }))
  }
  closeFoodModal = () => {
    this.setState(() => ({
      foodModalOpen: false,
      meal: null,
      day: null,
      food: null,
    }))
  }
  searchFood = (e) => {
    // Checks if the input is empty, if so, the function is returned out of
    if (!this.input.value) {
      return
    }

    // Google what this does, Cree.
    e.preventDefault()

    // Sets the loadingFood state to true in order for the Loading component to render
    this.setState(() => ({ loadingFood: true }))

    // Takes the input ref that was set and makes an api call.
    fetchRecipes(this.input.value)
      // when the food list is returned the state, causing a re-render of the component
      // loadingFood is also set to false in order for the loading component to stop being rendered
      .then((food) => this.setState(() => ({
        food,
        loadingFood: false,
      })))
  }
  render() {
    const { foodModalOpen, loadingFood, food } = this.state
    const { calendar, selectRecipe, remove } = this.props
    const mealOrder = ['breakfast', 'lunch', 'dinner']


    return (
      <div className='container'>

        <ul className='meal-types'>
          {mealOrder.map((mealType) => (
            <li key={mealType} className='subheader'>
              {capitalize(mealType)}
            </li>
          ))}
        </ul>

        <div className='calendar'>
          <div className='days'>
            {calendar.map(({ day }) => <h3 key={day} className='subheader'>{capitalize(day)}</h3>)}
          </div>
          <div className='icon-grid'>
            {/* maps over the calendar state */}
            {calendar.map(({ day, meals }) => (
              <ul key={day}>
                {/* Each meal type for each day will get an icon that will open the food modal */}
                {/* unless there is already food there */}
                {mealOrder.map((meal) => (
                  <li key={meal} className='meal'>
                    {meals[meal]
                      ? <div className='food-item'>
                          <img src={meals[meal].image} alt={meals[meal].label}/>
                          <button onClick={() => remove({meal, day})}>Clear</button>
                        </div>
                        // Triggers the openFoodModal function that will render the Modal Component
                      : <button onClick={() => this.openFoodModal({meal, day})} className='icon-btn'>
                          <CalendarIcon size={30}/>
                        </button>}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <Modal
          className='modal'
          overlayClassName='overlay'
          isOpen={foodModalOpen}
          onRequestClose={this.closeFoodModal}
          contentLabel='Modal'
        >
          <div>
            {/* Checks if loadingFood that is set in the searchFood function is true*/}
            {loadingFood === true
              // If so the loading icon will display to give the user some feedback
              ? <Loading delay={200} type='spin' color='#222' className='loading' />
              // If not the search container will be rendered
              : <div className='search-container'>
                  <h3 className='subheader'>
                    {/* Uses the state set when the modal is first opened */}
                    Find a meal for {capitalize(this.state.day)} {this.state.meal}.
                  </h3>
                  <div className='search'>
                    <input
                      className='food-input'
                      type='text'
                      placeholder='Search Foods'
                      // Creates a reference that can be used throughout the component
                      // Will be used in the searchFood function
                      ref={(input) => this.input = input}
                    />
                    <button
                      className='icon-btn'
                      // Triggers the search food function
                      onClick={this.searchFood}>
                        <ArrowRightIcon size={30}/>
                    </button>
                  </div>
                  {/* After the searchFood component is ran food should be set in the state and this will render */}
                  {food !== null && (
                    <FoodList
                      food={food}
                      // dispatches the selectRecipe action with the recipe, day, and meal.
                      onSelect={(recipe) => {
                        selectRecipe({ recipe, day: this.state.day, meal: this.state.meal })
                        // The food Modal is closed and the meal, day, and food state are set back to null
                        this.closeFoodModal()
                      }}
                    />)}
                </div>}
          </div>
        </Modal>

      </div>
    )
  }
}

function mapStateToProps ({ food, calendar }) {
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return {
    calendar: dayOrder.map((day) => ({
      day,
      meals: Object.keys(calendar[day]).reduce((meals, meal) => {
        meals[meal] = calendar[day][meal]
          ? food[calendar[day][meal]]
          : null

        return meals
      }, {})
    })),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    selectRecipe: (data) => dispatch(addRecipe(data)),
    remove: (data) => dispatch(removeFromCalendar(data))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)