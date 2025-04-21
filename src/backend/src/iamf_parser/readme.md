## IAMF Parser Reference

- We first pull the .proto files to `/proto` with the provided script.
- We then compile the .proto files to their TS wrapper in `/protoc`.
- Once we've configured the data within our application, we need to convert it to a .textproto for input to the next stage.
- Option 1: `Use protoc --encode with a descriptor: You can use the protoc CLI to encode a JSON input as .textproto, or convert binary back to textproto using --decode.`
