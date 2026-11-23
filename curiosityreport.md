
# Curiosity Report: Exploring the Node.js Event Loop

## 1. Introduction

For my curiosity report, I decided to learn more about the Node.js event loop and how it affects server performance. I have done a lot of work with Node.js for work (mostly with updating dependencies), but there's a lot more to explore and understand. I want to understand how Node.js handles multiple requests at the same time.

What happens when one request takes a really long time to finish? This is a question that has kept me awake for about 10 months (the time that I've started working with node), and finally I decided to do the research. When one request takes a long time, do the other requests slow down too, much like a wreck on I-15? Or can Node handle all of them at the same time?

This is related to DevOps because understanding server performance helps us make applications more responsive and reliable. As a customer, I want to be able to order Pokemon cards (or virtual pizza) as fast as possible with no hitches.

## 2. Research

I started by researching how the Node.js event loop works and the difference between blocking and non blocking code.

Node.js uses an event loop to coordinate asynchronous operations. It basically lets a server handle multiple requests without having to wait for every operation to finish.

But when synchronous JavaScript takes a long time to execute, it blocks the event loop. While the event loop is blocked, other JavaScript callbacks can't run.

I learned that `setTimeout()` is non-blocking because it schedules a callback to execute later instead of keeping the JavaScript thread busy. 

### Research Sources

- [Node.js: The Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js: Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node.js: Visual Guide](https://www.builder.io/blog/visual-guide-to-nodejs-event-loop)

## 3. Current State of the Art

In today's day and age, Node.js applications use asynchronous operations to keep servers responsive.

Us developers use promises, async/await, and non blocking APIs to handle operations like network requests and database communication.

Node.js gives some tools for measuring event loop performance. One example is `monitorEventLoopDelay()`, which helps us figure out when the event loop is experiencing delays.

These tools are important for DevOps because they help with testing application performance and seeing problems before they affect users.

One of my favorite stories comes from my first software development job interview. I was asked, "What is your debugging process?" I gave some generic answer about stepping through the application and finding the issue. Afterward, my dad joked that I should have answered, "I just push to prd and wait for user reports to come in!"

Unfortunately, that's not exactly what good DevOps engineers should do. By understanding how Node.js works, especially the event loop, we can find performance issues before pushing code to production. Instead of waiting for customers to complain, we can test and monitor applications to catch problems early.


## 4. Experiment 1: Blocking vs. Non-Blocking Requests

### Goal

My goal was to see how much blocking code affects the time it takes for a Node.js server to handle multiple requests.

### Hypothesis

I predicted that the blocking version would take longer because each request would keep the event loop busy for two seconds. I expected the non blocking version to finish faster because the requests could wait at the same time.

### Setup

First I made a Node.js HTTP server with two endpoints:

- `/blocking`: Uses a synchronous while loop that runs for approximately two seconds.
- `/nonblocking`: Uses `setTimeout()` to wait for approximately two seconds without blocking the event loop.

### Server Code

Then I created a file named `server.js`.

```javascript
const http = require('node:http');

const server = http.createServer((req, res) => {
  if (req.url === '/blocking') {
    const start = Date.now()

    while (Date.now() - start < 2000) {
      //block the event loop for 2 seconds
    }

    res.end('Blocking request finished')
  } else if (req.url === '/nonblocking') {
    setTimeout(() => {
      res.end('Non-blocking request finished')
    }, 2000)
  } else {
    res.end('Node.js server is running')
  }
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### Test Code

I created another file called `test.js` to send five requests to each endpoint.

```javascript
async function testRequests(path) {
  const start = performance.now()

  await Promise.all(
    Array.from({ length: 5 }, () =>
      fetch(`http://localhost:3000/${path}`)
    )
  )

  const seconds = (performance.now() - start) / 1000

  console.log(`${path}: ${seconds.toFixed(2)} seconds`)
}

async function main() {
  await testRequests('blocking')
  await testRequests('nonblocking')
}

main().catch(console.error)
```

### Steps to Reproduce

1. Install a current version of Node.js.
2. Create a folder named `node-event-loop`.
3. Create `server.js` and paste in the server code.
4. Create `test.js` and paste in that test code.
5. Open a terminal and run `node server.js`.
6. Open a second terminal and run `node test.js`.
7. Record the execution times for both endpoints.

### Results

| Request Type | Execution Time |
|---|---|
| Blocking | 10.08 seconds |
| Non-blocking | 2.01 seconds |
| Difference | 8.07 seconds |

The non-blocking version completed the five requests approximately five times faster than the blocking version.

### What I Learned

I was surprised that there was about an eight second difference between the two tests. That's a lot of time to wait for something, especially considering our short attention spans.

The blocking version took around ten seconds because each request kept the JavaScript thread busy for two seconds.

The non blocking version finished in about two seconds because the timers could run concurrently without keeping the event loop busy during the waiting period.

This helped me understand why blocking code can cause performance problems in Node.js applications. It also showed me that the way code handles waiting can make a big difference in server responsiveness.

## 5. Experiment 2: How One Slow Request Affects Other Users

### Goal

For my second experiment, I wanted to find out whether one slow request could delay another request that should normally respond immediately.

### Hypothesis

I thought that a simple request would be delayed when another request was blocking the event loop.

I was also thinking that the simple request would respond much faster when the slow request used non blocking code.

### Test Code

I created a file named `test2.js`.

```javascript
const baseURL = 'http://localhost:3000'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runExperiment(type) {
  console.log(`\nTesting ${type}...`)

  const slowRequest = fetch(`${baseURL}/${type}`)
  await sleep(100)
  const start = performance.now()

  const response = await fetch(baseURL)
  await response.text()

  const elapsed = performance.now() - start

  console.log(
    `Simple request response time: ${elapsed.toFixed(2)} ms`
  )

  await slowRequest
}

async function main() {
  await runExperiment('blocking')
  await runExperiment('nonblocking')
}

main().catch(console.error)
```

### Steps to Reproduce

1. Keep `server.js` running in the first terminal.
2. Create the `test2.js` file.
3. Paste the test code into the file.
4. Open another terminal.
5. Run `node test2.js`.
6. Record how long the simple request takes during each test.
7. Repeat the experiment to see whether the results are consistent.

### Results

*To be completed after running Experiment 2.*

| Test | Response Time |
|---|---|
| Simple request during blocking operation | TBD |
| Simple request during non-blocking operation | TBD |

### What I Learned

*To be completed after analyzing Experiment 2.*

## 6. Overall Conclusion

So far, my experiments have helped me understand why the Node.js event loop is important for server performance.

I learned that even though Node.js can handle multiple requests concurrently, synchronous code can still block the event loop and delay other requests.

Experiment 1 showed a major difference between blocking and non-blocking code. Experiment 2 will help me understand how this affects other users on the same server.

This research is useful for QA and DevOps because performance testing can reveal problems that might not be noticeable when testing only one request at a time.
