## IAMF Parser Reference

- We first pull the .proto files to `/proto` by navigating to the `/proto` dir and running `../pull_protos.sh`.
- We then navigate to the `/protoc` dir and compile the .proto files to their TS wrapper with `../compile_protos.sh`.
- Once we've configured the data within our application, we need to convert it to a .textproto for input to the next stage.
- Option 1: `Use protoc --encode with a descriptor: You can use the protoc CLI to encode a JSON input as .textproto, or convert binary back to textproto using --decode.`
