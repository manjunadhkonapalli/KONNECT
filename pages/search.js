import React from 'react'
import Search from "../components/Layout/Search"

function SearchPage() {
  return (
    <Search />
  )
}

export default SearchPage;

//We are creating this under pages folder bcz, all the tabs like message, notification, account, which are redirecting from homepage are here.
//In the mobile view, search area is no more a column. It will be another page redirecting from home page