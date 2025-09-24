document.addEventListener('DOMContentLoaded', () => {
  const postContainer = document.querySelector('.items')
  const paginationContainer = document.querySelector('.pages-container')
  const loadMoreLink = document.querySelector('a.page[title="Before"]')

  if (!postContainer || !paginationContainer || !loadMoreLink) {
    return
  }

  // Hide the original pagination
  paginationContainer.style.display = 'none'

  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      // Unobserve the current last element to prevent multiple triggers
      observer.unobserve(entries[0].target)

      try {
        const url = loadMoreLink.href
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const text = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')

        const newItems = doc.querySelectorAll('.items .item')
        if (newItems.length > 0) {
          newItems.forEach((item) => {
            // Use cloneNode to avoid issues with appending nodes from another document
            postContainer.appendChild(item.cloneNode(true))
          })

          // Update the "load more" link with the new one from the fetched page
          const newLoadMoreLink = doc.querySelector('a.page[title="Before"]')
          if (newLoadMoreLink) {
            loadMoreLink.href = newLoadMoreLink.href
            // Find the new last element and observe it
            const newLastItem = postContainer.querySelector('.item:last-child')
            if (newLastItem) {
              observer.observe(newLastItem)
            }
          }
          else {
            // No more pages, disconnect the observer
            observer.disconnect()
          }
        }
        else {
          // No new items found, disconnect
          observer.disconnect()
        }
      }
      catch (error) {
        console.error('Failed to fetch more posts:', error)
        // Show pagination again as a fallback
        paginationContainer.style.display = 'flex'
      }
    }
  }, {
    rootMargin: '200px 0px 0px 0px', // Trigger when 200px from the bottom of the viewport
  })

  // Start observing the last item on the initial page
  const lastItem = postContainer.querySelector('.item:last-child')
  if (lastItem) {
    observer.observe(lastItem)
  }
})
