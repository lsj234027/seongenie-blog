import React from 'react'

import './index.scss'

export const Search = () => {
  return (
    <div className="wrap search-component">
      <div className="search">
        <input type="text" className="searchTerm" placeholder="Search.." />
        <button type="submit" className="searchButton">
          <i className="fa fa-search" />
        </button>
      </div>
    </div>
  )
}
