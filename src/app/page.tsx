"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [filteredAdvocates, setFilteredAdvocates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minYears, setMinYears] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [pagination, setPagination] = useState({ totalPages: 1 });

  useEffect(() => {
    console.log("fetching advocates...");
    fetchData();
  }, [searchTerm, minYears, page]);

  const onChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const fetchData = async () => {
    const params = new URLSearchParams();
    params.set("q", searchTerm);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    params.set("minYears", minYears);
    const res = await fetch(`/api/advocates?${params.toString()}`);
    const { data, pagination } = await res.json();
    console.log(data);
    setFilteredAdvocates(data);
    setPagination(pagination);
  };

  const onClick = () => {
    setSearchTerm('');
    setMinYears(0);
  };

  function formatPhoneNumber(phone: string | number): string {
    const str = String(phone).replace(/\D/g, ''); // remove any non-digit characters
    if (str.length !== 10) return str; // fallback if it's not a 10-digit number
    const areaCode = str.slice(0, 3);
    const central = str.slice(3, 6);
    const line = str.slice(6);
    return `(${areaCode}) ${central}-${line}`;
  }

  const getSearchMessage = () => {
    if (!searchTerm && !minYears) {
      return "Showing all advocates";
    }
    const phrases = [];
    if (minYears) {
      phrases.push(`at least ${minYears} years of experience`);
    }

    let message = "Searching for advocates ";
    if (searchTerm) {
      message += `matching '${searchTerm}' `;
    }
    if (phrases.length > 0) {
      message += ` with ${phrases.join(" and ")}`;
    }

    return message;
  }

  return (
    <main className="m-6">
      <h1 className="text-3xl font-bold mb-4">Solace Advocates</h1>

      <div className="mb-6 p-6 bg-base-100 shadow-md rounded-box">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search input with label */}
          <div className="flex flex-col max-w-xs w-full">
            <label className="text-sm font-medium mb-1">Search</label>
            <input
              className="input input-bordered"
              placeholder="Search advocates..."
              value={searchTerm}
              onChange={onChange}
            />
          </div>

          {/* Minimum years select with label */}
          <div className="flex flex-col max-w-xs w-full">
            <label className="text-sm font-medium mb-1">Minimum Years of Experience</label>
            <select
              className="select select-bordered"
              value={minYears}
              onChange={(e) => setMinYears(e.target.value)}
            >
              <option value="0">Any</option>
              <option value="2">2+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <button className="btn btn-outline" onClick={onClick}>
              Reset
            </button>
          </div>
        </div>
      </div>
      <br />
      {filteredAdvocates.length > 0 && (
        <div>
          <div className="w-full text-center">
            <p className="mb-4 text-sm text-gray-500">
              {getSearchMessage()}
            </p>
          </div>
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
      <br />
      <table className="table table-zebra hover">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            return (
              <tr key={advocate.id}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td className="align-top text-sm text-gray-700">
                  <ul className="list-disc pl-4 space-y-1">
                    {advocate.specialties.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td className="whitespace-nowrap">{formatPhoneNumber(advocate.phoneNumber)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredAdvocates.length === 0 && (
        <div className="text-center py-4 text-gray-500 italic">No advocates match your search.</div>
      )}
    </main>
  );
}
