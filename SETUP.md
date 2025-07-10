# Chroma Client Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```env
   # ChromaDB Configuration
   CHROMA_URL=https://chromadb.estatemanager.online
   
   # Embeddings API Configuration
   EMBEDDINGS_API_URL=http://localhost:3000/api/embeddings
   
   # Next.js Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Test the connection:**
   - Navigate to `/test-server` to test your ChromaDB connection
   - If the connection fails, check the troubleshooting section below

## Troubleshooting

### Common Issues

#### 1. ChromaDB Connection Failed
**Symptoms:** "Failed to connect to ChromaDB" error when creating collections

**Solutions:**
- Verify your ChromaDB server is running
- Check the `CHROMA_URL` in your environment variables
- Ensure the server is accessible from your network
- Try the connection test at `/test-server`

#### 2. Embedding Generation Failed
**Symptoms:** "Failed to generate embeddings" error

**Solutions:**
- Check if the embeddings API is accessible
- Verify the `EMBEDDINGS_API_URL` setting
- Check browser console for network errors

#### 3. Collection Creation Issues
**Symptoms:** Collection creation fails with various errors

**Solutions:**
- Ensure collection names only contain letters, numbers, underscores, and hyphens
- Check that collection names are 2-50 characters long
- Verify metadata is valid JSON format
- Check server logs for detailed error messages

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CHROMA_URL` | ChromaDB server URL | `https://chromadb.estatemanager.online` |
| `EMBEDDINGS_API_URL` | Embeddings API endpoint | `http://localhost:3000/api/embeddings` |
| `NEXT_PUBLIC_BASE_URL` | Application base URL | `http://localhost:3000` |

### Testing Your Setup

1. **Connection Test:** Visit `/test-server` to test ChromaDB connectivity
2. **Create Collection:** Try creating a test collection at `/collections/new`
3. **Add Documents:** Add some test documents to verify full functionality

### Debug Mode

Enable debug logging by checking the browser console and server logs. The application includes extensive logging to help diagnose issues.

### Getting Help

If you're still experiencing issues:
1. Check the browser console for error messages
2. Review server logs in your terminal
3. Test the connection using the `/test-server` page
4. Verify all environment variables are set correctly 