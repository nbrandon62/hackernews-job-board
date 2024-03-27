import { useState, useEffect } from 'react';

import './App.css';

//todo:
//states: jobs, jobIds, loading, page
//create fetchIds() that will fetch the jobIds on initial load, anytime after that, we will just grab the next 6 ids
//create fetchJobs() that will receive the next 6 ids, and make an API call for those 6
//we will have a constant variable PAGE_SIZE = 6 to calculate the pagination
//conditionally render an <a> if url exists, else, render a <p> for the title
//don't render the button if there are no more jobs
//format time

const PAGE_SIZE = 6;

const JobPost = ({ job: { by, time, title, url } }) => {
  return (
    <div className='job-post'>
      <h2 className='job-title'>
      {url ?
        <a
          className='job-link' href={url} target='_blank'>{title}</a>
        :
          title }
      </h2>
      <div className='meta-data' aria-label='job post meta-data'>
        By: {by} {' '} posted on: {new Date(time * 1000).toLocaleDateString()}
      </div>
    </div>
  )
}

export default function App() {
  const [jobs, setJobs] = useState([])
  const [jobIds, setJobIds] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetchJobs(page)
  }, [page])

  const fetchIds = async (currPage) => {
    let ids = jobIds
    if (!ids) {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json')
      ids = await response.json()
      setJobIds(ids)
    }

    const start = currPage * PAGE_SIZE
    const end = start + PAGE_SIZE
    return ids.slice(start, end)
  }

  const fetchJobs = async (currPage) => {
    try {
      setLoading(true)
      const nextIds = await fetchIds(currPage)
      const moreJobs = await Promise.all(
        nextIds.map((id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP Error. Status code: ${res.status}`)
            } else {
              return res.json()
            }
          }).catch((error) => {
            console.error(`Error fetching item: ${id}. ${error.message}`)
          })
        ))
      setJobs([...jobs, ...moreJobs])
    }
    finally {
      setLoading(false)
    }
  }


  return (
    <div className='app'>
      <h1 className='job-board-header'>Hacker News Jobs Board</h1>
      {!jobs ? <div>Loading jobs...</div> : <div className='job-list'>
        {jobs.map((job) => (
          <JobPost key={job.id} job={job} />
        ))}
      </div>}
      {
        jobs.length > 0 &&
          page * PAGE_SIZE + PAGE_SIZE < jobIds.length
          ?
          <button
            disabled={loading}
            className='job-board-button'
            type='button'
            aria-label='load more jobs'
            onClick={() => setPage(page + 1)}
          >{loading ? 'Loading...' : 'Load More Jobs'}</button>
          : null
      }
    </div>
  );
}
