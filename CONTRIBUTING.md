# Contribute to Calculite

We welcome any contributions. Here are a few guidelines to get started.

- We strictly **do not accept AI generated code**. Any pull request containing AI generated code will be rejected.
- If your change involves a UI modification, please prioritize using the ```@material/web``` library.
- Try not to edit the global stylesheets if possible.
- Ensure that the code is **4 space indented using tabs**.
- Make sure to check the UI on both desktop and mobile.
- In the pull request, ensure you attach at least one screenshot relating to what you changed. Explain why the change is neccessary too.

## Building

### Website

1. **Clone this repository**

```bash
git clone https://github.com/ingStudiosOfficial/calculite.git
```

2. **Install dependencies**

Calculite uses npm workspaces, so to install just run

```bash
npm install # run from root
```

3. **Run website**

```bash
npm run dev:website
```

### Chrome Extension

Assuming you have run the first 2 steps from building the website, proceed with:

3. **Run Chrome Extension**

```bash
npm run dev:extension
```

4. **Load the Chrome Extension**

Go to ```chrome://extensions``` and click 'Load unpacked'. Then, pick the output directory (```extension/dist```). The Chrome Extension should hot reload automatically.

5. **Packaging the Chrome Extension**

Run ```npm run build:extension``` to build the extensionn first. To package the Chrome Extension into a ```.crx``` file, click 'Pack extension' and select the output directory. Calculite Chrome Extension is now ready!

Thank you for contributing to Calculite.