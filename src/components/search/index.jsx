import React from 'react'

import './index.scss'

export const Search = () => {
  return (
    <div class="wrap search-component">
      <div class="search">
        <input type="text" class="searchTerm" placeholder="Search.." />
        <button type="submit" class="searchButton">
          <i class="fa fa-search" />
        </button>
      </div>
    </div>
  )
}
