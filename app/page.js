'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    const userMessage = message.trim();  // Ensure there's content to send

    if (!userMessage) return;  // Don't send an empty message

    // Clear the input field and add user's message to the chat
    setMessage('')
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },  // Placeholder for assistant's response
    ])

    try {
      // Send the message to the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      let done = false

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone

        // Decode and append the assistant's response
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        result += text

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1]
          return [
            ...prevMessages.slice(0, prevMessages.length - 1),
            { ...lastMessage, content: lastMessage.content + text },  // Append text to assistant's message
          ]
        })
      }
    } catch (error) {
      console.error('Error receiving the message:', error)
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
