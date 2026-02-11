/**
 * Albato Partners API — search partners by name.
 * API: https://api.albato.com/partners/info
 */

(function () {
  'use strict';

  const API_BASE = 'https://api.albato.com/partners/info';

  /**
   * Get partner info by ID. Returns { partnerId, title } or null if not found.
   * @param {number} partnerId - Partner ID
   * @returns {Promise<{partnerId: number, title: string} | null>}
   */
  function getPartnerById(partnerId) {
    const id = parseInt(partnerId, 10);
    if (!Number.isInteger(id) || id <= 0) return Promise.resolve(null);

    const params = new URLSearchParams({
      'filter[deprecated]': '0',
      'filter[partnerId]': String(id),
    });
    const url = API_BASE + '?' + params.toString();

    return fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) return null;
        const p = json.data[0];
        return {
          partnerId: p.partnerId,
          title: p.title || p.titleEn || String(p.partnerId),
        };
      })
      .catch(() => null);
  }

  /**
   * Search partners by title. Returns array of { partnerId, title }.
   * @param {string} query - Search term (e.g. "hubspot")
   * @returns {Promise<Array<{partnerId: number, title: string}>>}
   */
  function searchPartners(query) {
    const q = (query || '').trim();
    if (!q) return Promise.resolve([]);

    const params = new URLSearchParams({
      'filter[deprecated]': '0',
      'filter[title][like]': q,
    });
    const url = API_BASE + '?' + params.toString();

    return fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !Array.isArray(json.data)) return [];
        return json.data.map((p) => ({
          partnerId: p.partnerId,
          title: p.title || p.titleEn || String(p.partnerId),
        }));
      })
      .catch(() => []);
  }

  window.PartnersApi = { searchPartners, getPartnerById };
})();
