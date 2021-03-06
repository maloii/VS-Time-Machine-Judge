package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
@Table(
        name="GROUP_SPORTSMAN",
        uniqueConstraints=
        @UniqueConstraint(columnNames={"GROUP_ID", "SPORTSMAN_ID"})
)
public class GroupSportsman {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private Integer sort;

    private Integer position = 0;

    @Column(name = "SEARCH_TRANSPONDER")
    private Boolean searchTransponder = false;

    @ManyToOne
    private Sportsman sportsman;

    @ManyToOne
    private Group group;

    @OneToMany(mappedBy = "groupSportsman", cascade = CascadeType.ALL)
    @OrderBy("millisecond ASC")
    private Set<Lap> laps;


}
