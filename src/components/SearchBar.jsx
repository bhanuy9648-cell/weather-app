import { useState } from 'react'
import PropTypes from 'prop-types'
import '../styles/Weather.css'

const SearchBar = ({ onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim())
      setSearchTerm('')
    }
  }

  const handleChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <form className="search-bar-container" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search city (e.g. London, Tokyo)..."
          value={searchTerm}
          onChange={handleChange}
          disabled={isLoading}
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchTerm('')}
            disabled={isLoading}
          >
            &times;
          </button>
        )}
      </div>
      <button type="submit" disabled={isLoading || !searchTerm.trim()} className="search-button">
        {isLoading ? (
          <div className="button-spinner"></div>
        ) : (
          <span>Search</span>
        )}
      </button>
    </form>
  )
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
}

SearchBar.defaultProps = {
  isLoading: false,
}

export default SearchBar
