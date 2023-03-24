(function () {
  var HOST = "https://dbn4sin1xpjx7.cloudfront.net/"

  addEventListener("trix-attachment-add", function (event) {
    if (event.attachment.file) {
      uploadFileAttachment(event.attachment)
    }
  })

  function uploadFileAttachment(attachment) {
    uploadFile(attachment.file, setAttributes)

    function setAttributes(attributes) {
      attachment.setAttributes(attributes)
    }
  }

  async function uploadFile(file, successCallback) {
    const key = createStorageKey(file)
    // get signed URL from app server
    const signedUrl = await fetch(`/getsignedurltrix?key=${key}`).then(res => res.json()).then(data => data.url)
    // upload photo to s3 using fetch
    console.log(signedUrl)
    await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: file
    })
    // set image attributes before adding it to the post body
    const attributes = {
      url: HOST + key,
      href: HOST + key + "?content-disposition=attachment"
    }
    successCallback(attributes)
  }

  function createStorageKey(file) {
    const date = new Date()
    const day = date.toISOString().slice(0, 10)
    const name = date.getTime() + "-" + file.name
    return ["blog-pictures", day, name].join("/")
  }

})();

// alert user if they have unsaved changes and attempt to close page or navigate away
// appies to /new and /edit pages
document.addEventListener("DOMContentLoaded", function () {
  let hasUnsavedChanges = false;
  window.onbeforeunload = function () {
    if (hasUnsavedChanges) {
      // return string only shown in older browser versions, newer versions show browser default text
      return "You have unsaved changes.";
    }
  };

  const blogForm = document.querySelector("#blog-form")
  if (blogForm) {
    // fires when any text is typed, including in trix editor
    this.body.addEventListener("keyup", () => {
      hasUnsavedChanges = true;
    })
    // fires when inputs other than trix editor are changed, to ensure post status changes are recorded
    blogForm.addEventListener("change", () => {
      hasUnsavedChanges = true;
    })

    const blogCancel = document.querySelector(".blog-cancel")
    blogCancel.addEventListener("click", (e) => {
      switch (e.target.name) {
        case 'new':
          window.onbeforeunload = ''
          window.location.href = '/'
          break;
        case 'edit':
          window.onbeforeunload = ''
          // express passes post slug to pug, which assigns it to the 'pug' html attribute this js references
          window.location.href = `/${e.target.dataset.slug}`
          break;
      }
    })

    blogForm.addEventListener("submit", (e) => {
      // show message if user hasn't entered title
      const blogTitle = document.querySelector('#blog-post-title')
      if (!blogTitle.checkValidity()) {
        e.preventDefault()
        blogTitle.classList.add('is-invalid')
        // add listener that fires when title entered and removes styling
        blogTitle.addEventListener("keyup", () => {
          blogTitle.classList.remove('is-invalid')
        }, { once: true })
      }

      // show invalid messaging if user hasn't entered post content, otherwise save the post
      const blogPostBody = document.querySelector('trix-editor.trix-content')
      const blogInvalidMessage = document.querySelector('#blog-invalid-message')

      if (!blogPostBody.innerHTML) {
        e.preventDefault()
        blogPostBody.classList.add('blog-invalid-input')
        blogInvalidMessage.classList.remove('d-none')
        // add listener that fires when post content is entered and removes the styling
        blogPostBody.addEventListener("DOMSubtreeModified", () => {
          blogPostBody.classList.remove('blog-invalid-input')
          blogInvalidMessage.classList.add('d-none')
        }, { once: true })
      } else {
        window.onbeforeunload = ''
      }
    })
  }
})