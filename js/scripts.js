$(document).ready(function () {
  const $table = $("#myTable"); // Select the table
  const $tableBody = $table.find("tbody"); // Select the table body

  // Function to generate table rows from JSON data
  function generateTableRows(data) {
    data.forEach((row) => {
      const $tr = $("<tr></tr>");
      $tr.append(`<td>${row.name}</td>`);
      $tr.append(`<td>${row.feature_source}</td>`);
      $tr.append(`<td>${row.entry_type}</td>`);
      $tr.append(`<td>${row.related_functionality}</td>`);
      $tr.append(`<td>${row.keyboard_shortcut}</td>`); // Get the HTML content
      $tr.append(
        `<td class="centered_td"><span class="uk-label ${row.description_added.value_class}">${row.description_added.status}</span></td>`
      );
      $tr.append(`<td>${row.description}</td>`);
      $tr.append(`<td>${row.screenshot}</td>`);
      $tr.append(`<td>${row.demonstration}</td>`);
      $tableBody.append($tr);
    });
  }

  // Fetch JSON data and generate table rows
  $.getJSON("data/table_data.json", function (data) {
    generateTableRows(data);

    const $headers = $table.find("th"); // Select all table headers
    const $rows = $tableBody.find("tr"); // Select all table rows
    console.log(`there are ${$rows.length} rows`);
    const $nameFilter = $("#nameFilter"); // Select the name filter input
    const $clearNameFilter = $("#clearNameFilter"); // Select the clear filter button

    // Sort function
    function sortColumn($header) {
      const index = $headers.index($header); // Get the index of the clicked header
      const isAsc = $header.hasClass("asc"); // Check if it's already sorted ascending
      const direction = isAsc ? -1 : 1; // Determine sort direction

      const sortedRows = $rows.toArray().sort((a, b) => {
        const aColText = $(a).find(`td:eq(${index})`).text().trim();
        const bColText = $(b).find(`td:eq(${index})`).text().trim();
        return aColText > bColText ? direction : -direction;
      });

      $tableBody.empty().append(sortedRows); // Replace table body with sorted rows
      $headers.removeClass("asc desc"); // Remove sort classes from all headers
      $header.toggleClass("asc", !isAsc).toggleClass("desc", isAsc); // Add appropriate sort class
    }

    // Add click event to sort icons
    $(document).on("click", ".icon-sort", function (event) {
      event.stopPropagation();
      const $header = $(this).closest("th");
      sortColumn($header);
      toggleSortIcon($header);
    });

    // Add this function to toggle the sort icon
    function toggleSortIcon($header) {
      const $icon = $header.find(".icon-sort span[uk-icon]");
      const currentIcon = $icon.attr("uk-icon");

      if (currentIcon.includes("chevron-up")) {
        $icon.attr("uk-icon", "icon: chevron-down; ratio: .8");
      } else {
        $icon.attr("uk-icon", "icon: chevron-up; ratio: .8");
      }
    }

    // Function to close all filter options
    function closeAllFilterOptions() {
      $(".filter-options").hide();
    }

    // Close filter options when clicking outside
    $(document).on("click", function (event) {
      if (!$(event.target).closest(".filter-options, .icon-filter").length) {
        closeAllFilterOptions();
      }
    });

    // Close filter options when scrolling horizontally
    $(".table-wrapper").on("scroll", closeAllFilterOptions);

    // Handle filter icon clicks
    $(document).on("click", ".icon-filter", function (event) {
      event.stopPropagation();
      const targetId = $(this).data("filter-target");
      const $targetOptions = $(targetId);

      if ($targetOptions.length === 0) {
        return;
      }

      $(".filter-options").not($targetOptions).hide(); // Hide other filter options
      $targetOptions.toggle(); // Toggle visibility of clicked filter options

      if ($targetOptions.is(":visible")) {
        const iconRect = this.getBoundingClientRect();
        $targetOptions.css({
          top: iconRect.bottom + window.scrollY + "px",
          left: iconRect.left + window.scrollX + "px",
          position: "absolute",
          zIndex: 1000,
        });
      }
    });

    // Ensure filter options are initially hidden
    $(".filter-options").hide();

    // Remove 'hidden' attribute from filter options
    $(".filter-options").removeAttr("hidden");

    // Filter table function
    function filterTable() {
      const nameFilterValue = $nameFilter.val().toLowerCase();
      const filters = {};

      $(".filter-options[data-column]").each(function () {
        const columnName = $(this).data("column");
        const columnIndex = $headers
          .filter(`[data-column="${columnName}"]`)
          .index();

        if (columnIndex !== -1) {
          const checkedValues = $(this)
            .find('input[type="checkbox"]:checked')
            .map(function () {
              return $(this).val();
            })
            .get();

          if (checkedValues.length > 0) {
            filters[columnIndex] = checkedValues;
          }
        }
      });

      $rows.each(function () {
        let display = true;
        const nameCell = $(this).find("td:first").text().toLowerCase();

        if (nameFilterValue && !nameCell.includes(nameFilterValue)) {
          display = false;
        }

        $.each(
          filters,
          function (columnIndex, values) {
            const cellValue = $(this)
              .find(`td:eq(${columnIndex})`)
              .text()
              .trim();
            if (values.length > 0 && !values.includes(cellValue)) {
              display = false;
            }
          }.bind(this)
        );

        $(this).toggle(display);
      });

      updateAllFilterIconColors();
    }

    // Add event listener for name filter input
    $nameFilter.on("input", filterTable);

    // Add event listener for clearing the name filter
    $clearNameFilter.on("click", function (event) {
      event.preventDefault();
      $nameFilter.val("").trigger("input");
      $(this).hide();
    });

    // Show/hide clear icon based on input content
    $nameFilter.on("input", function () {
      $clearNameFilter.toggle(Boolean($(this).val()));
    });

    // Add event listeners for checkbox changes
    $(document).on(
      "change",
      '.filter-options input[type="checkbox"]',
      function () {
        filterTable();
        updateFilterIconColor($(this).closest(".filter-options").attr("id"));
      }
    );

    function updateFilterIconColor(filterOptionsId) {
      const $filterIcon = $(`[data-filter-target="#${filterOptionsId}"]`);
      const $checkedBoxes = $(`#${filterOptionsId}`).find(
        'input[type="checkbox"]:checked'
      );
      $filterIcon.toggleClass("active", $checkedBoxes.length > 0);
    }

    function updateAllFilterIconColors() {
      $(".filter-options").each(function () {
        updateFilterIconColor($(this).attr("id"));
      });
    }

    // Call this function after the initial page load
    updateAllFilterIconColors();

    $(document).on("click", ".open-lightbox", function (event) {
      event.preventDefault();
      const targetId = $(this).attr("data-target-id");
      console.log("Target ID:", targetId);
      const gallery = $("#media-gallery");
      const items = gallery.find("a");
      let targetIndex = -1;

      items.each(function (index) {
        if ($(this).attr("data-id") === targetId) {
          targetIndex = index;
          console.log("Target found at index:", targetIndex);
          return false; // Break the loop
        }
      });

      if (targetIndex !== -1) {
        console.log("Opening lightbox at index:", targetIndex);
        const lightboxItems = items
          .map(function () {
            return {
              source: $(this).attr("href"),
              caption: $(this).attr("data-caption"),
            };
          })
          .get();

        const lightbox = UIkit.lightboxPanel({ items: lightboxItems });
        lightbox.show(targetIndex);
      } else {
        console.error("Target ID not found: " + targetId);
      }
    });
  });
});
