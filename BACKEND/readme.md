1xx — Informational

100 Continue – Request received, continue process.

101 Switching Protocols – Server is switching protocols as requested by the client.

102 Processing – Server is processing the request, but no response is available yet.

2xx — Success

200 OK – Request succeeded.

201 Created – Resource successfully created.

202 Accepted – Request accepted but not yet processed.

203 Non-Authoritative Information – Response modified from origin.

204 No Content – Request succeeded, no content returned.

205 Reset Content – Tell client to reset view/form.

206 Partial Content – Partial resource sent (used with range headers).

3xx — Redirection

300 Multiple Choices – Multiple options available for the resource.

301 Moved Permanently – Resource moved to a new URL.

302 Found – Temporary redirection.

303 See Other – Redirect to another resource (GET).

304 Not Modified – Resource not changed since last request (used for caching).

307 Temporary Redirect – Resource temporarily located at another URI.

308 Permanent Redirect – Resource permanently located at another URI.

4xx — Client Error

400 Bad Request – Invalid request syntax or parameters.

401 Unauthorized – Authentication required or failed.

403 Forbidden – Client lacks permission to access the resource.

404 Not Found – Resource not found on the server.

405 Method Not Allowed – HTTP method not supported for this resource.

408 Request Timeout – Client took too long to send the request.

409 Conflict – Request conflicts with current server state.

410 Gone – Resource permanently deleted.

413 Payload Too Large – Request body too large.

414 URI Too Long – URL too long to process.

415 Unsupported Media Type – Server can’t process the given media format.

422 Unprocessable Entity – Semantic error (common in APIs).

429 Too Many Requests – Rate limit exceeded.

5xx — Server Error

500 Internal Server Error – Generic server error.

501 Not Implemented – Server doesn’t support the request method.

502 Bad Gateway – Invalid response from an upstream server.

503 Service Unavailable – Server temporarily unavailable (maintenance or overload).

504 Gateway Timeout – Upstream server failed to respond in time.

505 HTTP Version Not Supported – Server doesn’t support the HTTP version used.