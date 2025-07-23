/*
 *  ======================================================
 *  -------------pikidiary user image stuff---------------
 *             CODE BY SQUIRREL GREG ACORNS!!
 *  ======================================================
 *          Give credit if you steal my code sob
 *  ======================================================
 *  /////////////////////////////////////////////////////////////////////////////
 *  MIT License
 *  
 *  Copyright (c) 2025 Squirrel
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *  /////////////////////////////////////////////////////////////////////////////
 */
import fetch from 'node-fetch';
export default async function handler(req, res) {
  const rawPath = req.url || '';
  let { username } = req.query;
  let imageType = null;
  if (rawPath.includes('/banner/')) {
    imageType = 'banner';
    const bannerMatch = rawPath.match(/\/banner\/([^\/]+)/);
    if (bannerMatch) {
      username = bannerMatch[1].replace(/\.[^.]*$/, '');
    }
  } else if (rawPath.includes('/pfp/')) {
    imageType = 'pfp';
    const pfpMatch = rawPath.match(/\/pfp\/([^\/]+)/);
    if (pfpMatch) {
      username = pfpMatch[1].replace(/\.[^.]*$/, '');
    }
  } else if (rawPath === '/' || rawPath === '') {
        res.setHeader('Content-Type', 'text/plain');
        res.status(400).send('this is a really simple api that returns a users banner or profile easily!!!\n\nfor banner:\n\tbanner/username\nfor pfp:\n\tpfp/username');
        return;
  } else {
        res.setHeader('Content-Type', 'text/plain');
        res.status(400).send('invalid route.. use /banner/username or /pfp/username');
        return;
    }
  if (!username) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(400).send('needs a username!!\n/banner/username or /pfp/username');
    return;
  }
  try {
    const response = await fetch(`https://pikidiary-api.vercel.app/?username=${username}`);
    const data = await response.json();
    if (data.status == 404) {
      res.status(404).json({ error: 'user not found' });
      return;
    }
    let imageUrl = null;
    if (imageType === 'banner') {gi
      if (!data.banner || !data.banner.startsWith('http')) {
        res.status(404).json({ error: 'banner not found for this user (or user doesn\'t exist)' });
        return;
      }
      imageUrl = data.banner;
    } else if (imageType === 'pfp') {
      if (!data.pfp || !data.pfp.startsWith('http')) {
        res.status(404).json({ error: 'profile picture not found for this user (or user doesn\'t exist)' });
        return;
      }
      imageUrl = data.pfp;
    }
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error(`failed to fetch ${imageType} image`);
    }
    const contentType = imgRes.headers.get('content-type');
    if (contentType && contentType.startsWith('image/')) {
      res.setHeader('Content-Type', contentType);
    } else {
      res.setHeader('Content-Type', 'image/png');
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');
    imgRes.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'internal server error', detail: err.message });
  }
}
