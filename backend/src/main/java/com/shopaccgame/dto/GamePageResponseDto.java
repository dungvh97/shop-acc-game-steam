package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.stream.Collectors;

public class GamePageResponseDto {
    private List<GameWithPriceDto> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;

    public GamePageResponseDto() {}

    public GamePageResponseDto(Page<GameWithPriceDto> gamePage) {
        this.content = gamePage.getContent();
        this.pageNumber = gamePage.getNumber();
        this.pageSize = gamePage.getSize();
        this.totalElements = gamePage.getTotalElements();
        this.totalPages = gamePage.getTotalPages();
        this.first = gamePage.isFirst();
        this.last = gamePage.isLast();
        this.hasNext = gamePage.hasNext();
        this.hasPrevious = gamePage.hasPrevious();
    }

    // Static factory method
    public static GamePageResponseDto from(Page<GameWithPriceDto> gamePage) {
        return new GamePageResponseDto(gamePage);
    }

    // Getters and Setters
    public List<GameWithPriceDto> getContent() {
        return content;
    }

    public void setContent(List<GameWithPriceDto> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }
}
